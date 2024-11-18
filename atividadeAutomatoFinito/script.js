/** @import { AutomataDefinition } from '../lib/automata.js' */
/** @import { * } from '../lib/convertions.js' */
jsPlumbContainer = document.getElementById("myDiagramDiv");
console.log(jsPlumb.version); // Logs the jsPlumb version

const instance = jsPlumb.newInstance({
  container: jsPlumbContainer,
  dragOptions: {
    containment: "parentEnclosed",
  },
});

const selectInitialStateElement = document.getElementById("initStateSelect");
const finalStatesElement = document.getElementById("finalStatesSelect");
const deleteStateElement = document.getElementById("deleteStateSelect");
const automataReadingSettingsDiv = document.getElementById(
  "automataReadingSettingsDiv"
);
const startButton = document.getElementById("startButton");
const stepButton = document.getElementById("stepButton");

/**
 * @type {Map<string, string>}
 */
const mapIdToStateName = new Map();

function syncStates() {
  selectInitialStateElement.innerHTML = "";
  finalStatesElement.innerHTML = "";
  deleteStateElement.innerHTML = "";
  mapIdToStateName.entries().forEach(([id, state]) => {
    const option = document.createElement("option");
    option.text = state;
    option.value = id;
    selectInitialStateElement.add(option);
    finalStatesElement.add(option.cloneNode(true));
    deleteStateElement.add(option.cloneNode(true));
  });

  const isEmpty = mapIdToStateName.size === 0;

  if (isEmpty) {
    automataReadingSettingsDiv.style.display = "none";
    startButton.disabled = true;
  } else {
    automataReadingSettingsDiv.style.display = "flex";
    startButton.disabled = false;
  }
}

const letterValidationRegex = /^[a-zA-Zλ]$/;
let automataDefinition = null;
let configurations = [];

let number = 0;
document.getElementById("NodeNameInput").value = `q${number}`;

const mapEnglishStatusToPortuguese = {
  READING: "Em leitura",
  ACCEPTED: "Aceita",
  REJECTED: "Rejeitada",
};

// Function to add a new node dynamically
function addNode() {
  // Create a new div element
  const newNode = document.createElement("div");

  // Set an ID and class for the new node
  const nodeId = `node-${Date.now()}`; // Unique ID based on timestamp
  newNode.id = nodeId;
  newNode.style.position = "absolute";
  newNode.style.padding = "3rem";
  newNode.style.borderWidth = "1px";
  newNode.style.border = "solid 2px red";
  newNode.style.borderRadius = "100%";
  newNode.style.fontSize = "2rem";

  // Set the inner text to the current number
  const nodeStateName = document.getElementById("NodeNameInput").value;
  newNode.innerText = nodeStateName;
  mapIdToStateName.set(nodeId, nodeStateName);

  // Append the new node to the container
  const container = document.getElementById("myDiagramDiv");
  container.appendChild(newNode);

  // Add the node as a new endpoint in jsPlumb
  addNewNode(nodeId);

  // Increment the number and update the input field
  number = number + 1;
  document.getElementById("NodeNameInput").value = `q${number}`; // Update input field with the new number

  syncStates();
}

// Example of adding jsPlumb endpoint to new node
function addNewNode(elementId) {
  const node = document.getElementById(elementId);

  if (!node) {
    console.error("Element not found");
    return;
  }

  for (anchor of ["Left", "Right"]) {
    instance.addEndpoint(node, {
      target: true,
      source: true,
      endpoints: ["Dot"],
      anchor: anchor,
      maxConnections: -1,
      connectorOverlays: [
        { type: "PlainArrow", options: { location: 1 } },
        { type: "Label", options: { label: "", id: `label-${Date.now()}` } },
      ],
      dragOptions: {
        cursor: "pointer",
        zIndex: 2000,
      },
    });
  }
}

instance.bind("connection", function (info) {
  let transitionLetter = window.prompt("Insira a letra da transição: ");
  if (transitionLetter === "") {
    transitionLetter = "λ";
  }
  if (letterValidationRegex.test(transitionLetter) === false) {
    alert("A transição deve ser uma letra.");
    instance.deleteConnection(info.connection);
    return;
  }

  const connection = info.connection;
  const source = info.source;
  const target = info.target;

  instance.deleteConnection(connection);
  const connections = instance.getConnections({ source, target });
  if (connections.length === 1) {
    debugger;
    const connection = connections[0];
    addLetterToConnection(connection, transitionLetter);
  } else {
    instance.connect({
      source,
      target,
      anchor: ["Left", "Right"],
      connector: "Bezier",
      overlays: [
        { type: "PlainArrow", options: { location: 1 } },
        {
          type: "Label",
          options: {
            label: transitionLetter,
            id: `label-${Date.now()}`,
            cssClass: "customLabel",
          },
        },
      ],
      doNotFireConnectionEvent: true,
    });
  }
});

function setConfigurations(newValue) {
  const initialString = document.getElementById("StringInput").value;
  configurations = newValue;
  document.getElementById("stepButton").disabled = newValue.length === 0;
  // reset html in configurations div
  document.getElementById("configurations").innerHTML = "";
  // map configurations through history
  configurations.forEach((config, index) => {
    const p = document.createElement("p");
    let text = `Configuração ${index + 1}: ${
      mapEnglishStatusToPortuguese[config.currentStatus]
    }`;
    let currentInput = initialString;
    config.history.forEach((transition, index) => {
      text += `\n[${currentInput}] ${transition.origin} --(${
        transition.symbol || "λ"
      })--> ${transition.target}`;
      currentInput = currentInput.slice(transition.symbol.length);
      text += ` [${currentInput}]`;
    });
    text += `\n${config.currentState}`;
    p.innerText = text;
    document.getElementById("configurations").appendChild(p);
  });
  const noReadingConfigurations = configurations.every(
    (config) => config.currentStatus !== "READING"
  );
  if (noReadingConfigurations) {
    document.getElementById("stepButton").disabled = true;
  }
}

function addLetterToConnection(connection, letter) {
  const overlays = connection.getOverlays();
  for (const v of Object.values(overlays)) {
    if (v.type === "Label") {
      const currentLabel = v.getLabel();
      v.setLabel(`${currentLabel}\n${letter}`);
    }
  }
}

function getTransitionLettersFromConnection(connection) {
  for (const v of Object.values(connection.overlays)) {
    if (v.type === "Label") {
      return v
        .getLabel()
        .split("\n")
        .map((letter) => (letter === "λ" ? "" : letter));
    }
  }
}

function startReading() {
  const initialStateId = document.getElementById("initStateSelect").value;
  const initialState = mapIdToStateName.get(initialStateId);
  const finalStates = Array.from(
    document.getElementById("finalStatesSelect").selectedOptions
  ).map((stateId) => mapIdToStateName.get(stateId.value));

  if (initialState === "") {
    alert("Selecione um estado inicial.");
    return;
  }

  if (finalStates.length === 0) {
    alert("Selecione ao menos um estado final.");
    return;
  }

  automataDefinition = new AutomataDefinition();
  const states = Array.from(mapIdToStateName.values());
  states.forEach((state) => automataDefinition.addState(state));
  const connections = instance.getConnections();
  connections.forEach((connection) => {
    const sourceId = connection.sourceId;
    const sourceState = mapIdToStateName.get(sourceId);
    const targetId = connection.targetId;
    const targetState = mapIdToStateName.get(targetId);
    const transitionLetters = getTransitionLettersFromConnection(connection);
    transitionLetters.forEach((transitionLetter) => {
      automataDefinition.addAlphabet(transitionLetter);
      automataDefinition.addTransition(
        sourceState,
        transitionLetter,
        targetState
      );
    });
  });
  automataDefinition.setInitialState(initialState);
  finalStates.forEach((state) => automataDefinition.addFinalState(state));
  const initialString = document.getElementById("StringInput").value;
  setConfigurations(
    automataDefinition.startReadingConfiguration(initialString)
  );
  document.getElementById("stepButton").disabled = false;
}

function advanceConfigurations() {
  if (configurations.length === 0 || automataDefinition === null) {
    alert("Nenhuma configuração para avançar.");
    return;
  }
  setConfigurations(
    automataDefinition.advanceMultipleConfigurations(configurations)
  );
}

function deleteSelectedState() {
  const selectedState = document.getElementById("deleteStateSelect").value;
  const connections = instance.getConnections();
  connections
    .filter(
      (connection) =>
        connection.sourceId === selectedState ||
        connection.targetId === selectedState
    )
    .forEach((connection) => instance.deleteConnection(connection));
  const stateElement = document.getElementById(selectedState);
  instance.selectEndpoints({ source: stateElement }).deleteAll();
  stateElement.remove();
  mapIdToStateName.delete(selectedState);
  syncStates();
}

if (sessionStorage.getItem("grammarToAutomata")) {
  const grammar = JSON.parse(sessionStorage.getItem("grammarToAutomata"));
  console.log(grammar);

  sessionStorage.removeItem("grammarToAutomata");
  const automata = grammarToAutomata(grammar);
  console.log(automata);
}

function automataToGrammar() {
  const currentHref = window.location.href;
  window.sessionStorage.setItem("automataToGrammar",null);
  let newPath = currentHref.substring(0, currentHref.lastIndexOf("/"));
  newPath = newPath.substring(0, newPath.lastIndexOf("/"));
  newPath += "/atividadeGramaticaRegular/index.html";
  window.location.href = newPath;
}

function automataToRegex() {
  const currentHref = window.location.href;
  window.sessionStorage.setItem("automataToRegex",null);
  let newPath = currentHref.substring(0, currentHref.lastIndexOf("/"));
  newPath = newPath.substring(0, newPath.lastIndexOf("/"));
  newPath += "/atividadeRegex/index.html";
  window.location.href = newPath;
}
