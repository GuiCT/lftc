/** @import { TuringMachine } from "../lib/turing.js" */

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
const turingReadingSettingsDiv = document.getElementById(
  "turingReadingSettingsDiv"
);
const startButton = document.getElementById("startButton");
const stepButton = document.getElementById("stepButton");
const modalReference = document.getElementById("inputModal");
const inputReadSymbol = document.getElementById("inputReadSymbol");
const inputWriteSymbol = document.getElementById("inputWriteSymbol");
const inputSelectDirection = document.getElementById("inputSelectDirection");
const confirmTransitionAddButton = document.getElementById(
  "confirmTransitionAdd"
);

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
    turingReadingSettingsDiv.style.display = "none";
    startButton.disabled = true;
  } else {
    turingReadingSettingsDiv.style.display = "flex";
    startButton.disabled = false;
  }
}

const letterValidationRegex = /^[a-zA-Zλ]$/;
/**
 * @type {TuringMachine | null}
 */
let turingMachine = null;
let configurations = [];

let number = 0;
document.getElementById("NodeNameInput").value = `q${number}`;

const mapEnglishStatusToPortuguese = {
  READING: "Em leitura",
  ACCEPTED: "Aceita",
  REJECTED: "Rejeitada",
};

const mapDirectionSymbolToEnum = {
  "R": "RIGHT",
  "L": "LEFT",
  "S": "STAY",
};

// Function to add a new node dynamically
function addNode() {
  // Create a new div element
  const newNode = document.createElement("div");

  // Set an ID and class for the new node
  // Random integer between 1 and 100 to avoid conflicts with duplicate timestamps
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  const nodeId = `node-${Date.now()}-${randomNumber}`; // Unique ID based on timestamp and a random value
  newNode.id = nodeId;
  newNode.style.position = "absolute";
  newNode.style.padding = "3rem";
  newNode.style.borderWidth = "1px";
  newNode.style.border = "solid 2px red";
  newNode.style.borderRadius = "100%";
  newNode.style.fontSize = "2rem";
  // random position within 80%
  newNode.style.left = `${Math.random() * 80}%`;
  newNode.style.top = `${Math.random() * 80}%`;

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

  for (anchor of ["Left", "Right", "Top", "Bottom"]) {
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

function formatTransition(read, write, direction) {
  return `${read}; ${write} | ${direction}`;
}

/**
 * @param {string} formatted
 * @returns {[string, string, string]}
 */
function transitionFromFormat(formatted) {
  const [read, tail] = formatted.split("; ");
  const [write, direction] = tail.split(" | ");
  return [read, write, direction];
}

function addTransitionToLabel(connection, read, write, direction) {
  const formatted = formatTransition(read, write, direction);
  const overlays = connection.getOverlays();
  for (const v of Object.values(overlays)) {
    if (v.type === "Label") {
      const currentLabel = v.getLabel();
      v.setLabel(`${currentLabel}\n${formatted}`);
    }
  }
}

/**
 * @param {unknown} connection
 * @returns {Array<[string, string, string]>}
 */
function getTransitionsFromLabel(connection) {
  for (const v of Object.values(connection.overlays)) {
    if (v.type === "Label") {
      return v
        .getLabel()
        .split("\n")
        .map((formatted) => transitionFromFormat(formatted));
    }
  }
}

instance.bind("connection", function (info) {
  modalReference.style.display = "flex";
  inputReadSymbol.value = "";
  inputWriteSymbol.value = "";
  inputSelectDirection.value = "L";
  const connection = info.connection;
  const source = info.source;
  const target = info.target;
  instance.deleteConnection(connection);
  const connections = instance.getConnections({ source, target });
  confirmTransitionAddButton.onclick = () => {
    const readSymbol = inputReadSymbol.value || "λ";
    const writeSymbol = inputWriteSymbol.value || "λ";
    const direction = inputSelectDirection.value;

    if (connections.length === 1) {
      const connection = connections[0];
      addTransitionToLabel(connection, readSymbol, writeSymbol, direction);
      modalReference.style.display = "none";
      return;
    }

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
            label: formatTransition(readSymbol, writeSymbol, direction),
            id: `label-${Date.now()}`,
            cssClass: "customLabel",
          },
        },
      ],
      doNotFireConnectionEvent: true,
    });
    modalReference.style.display = "none";
  };
});

/**
 * @param {Array<string>} tape
 * @param {number} position
 */
function formatTape(tape, position) {
  const before = tape.slice(0, position);
  const at = tape[position] || "□";
  const after = tape.splice(position + 1);
  return `${before.join("")}[${at}]${after.join("")}`;
}

/**
 * @param {Array<TuringConfiguration>} newValue
 */
function setConfigurations(newValue) {
  configurations = newValue;
  document.getElementById("stepButton").disabled = newValue.length === 0;
  // reset html in configurations div
  document.getElementById("configurations").innerHTML = "";
  // map configurations through history
  configurations.forEach((config, index) => {
    const p = document.createElement("p");
    let text = `Configuração ${index + 1}: ${mapEnglishStatusToPortuguese[config.currentStatus]}\nFita: ${formatTape([...config.tape], config.headPosition)}`;
    config.history.forEach((transition) => {
      text += `\n${transition.origin} --(${transition.symbol || "λ"
        })--> ${transition.target}`;
    });
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

  turingMachine = new TuringMachine();
  const states = Array.from(mapIdToStateName.values());
  states.forEach((state) => turingMachine.addState(state));
  const connections = instance.getConnections();
  console.log(connections);

  connections.forEach((connection) => {
    const sourceId = connection.sourceId;
    const sourceState = mapIdToStateName.get(sourceId);
    const targetId = connection.targetId;
    const targetState = mapIdToStateName.get(targetId);
    const transitionSymbols = getTransitionsFromLabel(connection);

    transitionSymbols.forEach(([read, write, direction]) => {
      const directionTape = mapDirectionSymbolToEnum[direction];
      turingMachine.addAlphabet(read);
      turingMachine.addAlphabet(write);
      turingMachine.addTransition(
        sourceState,
        read,
        targetState,
        write,
        directionTape
      );
    });
  });
  turingMachine.setInitialState(initialState);
  finalStates.forEach((state) => turingMachine.addFinalState(state));
  const initialString = document.getElementById("StringInput").value;
  setConfigurations(turingMachine.startReadingConfiguration(initialString));
  document.getElementById("stepButton").disabled = false;
  console.log(turingMachine);
}

function advanceConfigurations() {
  if (configurations.length === 0 || turingMachine === null) {
    alert("Nenhuma configuração para avançar.");
    return;
  }
  let configurationsAdvance = turingMachine.advanceMultipleConfigurations(configurations)
  setConfigurations(
    configurationsAdvance
  )
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

// Lidando com estado do modal
window.onclick = function (event) {
  if (event.target == modalReference) {
    modalReference.style.display = "none";
    confirmTransitionAddButton.onclick = () => { };
  }
};
