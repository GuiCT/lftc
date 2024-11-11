jsPlumbContainer = document.getElementById("myDiagramDiv");
console.log(jsPlumb.version); // Logs the jsPlumb version

const instance = jsPlumb.newInstance({
  container: jsPlumbContainer,
  dragOptions: {
    containment: "parentEnclosed",
  },
});

/**
 * @type {Map<string, string>}
 */
const mapIdToStateName = new Map();
const automataDefinition = new AutomataDefinition();
const selectElement = document.getElementById("initStateSelect");
let configurations = [];

selectElement.addEventListener("change", (e) => {
  const selectedState = e.target.value;
  automataDefinition.setInitialState(selectedState);
});

let number = 0;
document.getElementById("NodeNameInput").value = `q${number}`;

const mapEnglishStatusToPortuguese = {
  "READING": "Em leitura",
  "ACCEPTED": "Aceita",
  "REJECTED": "Rejeitada",
};

// Function to add a new node dynamically
function addNode() {
  // Create a new div element
  const newNode = document.createElement("div");

  // Set an ID and class for the new node
  const nodeId = `node-${Date.now()}`; // Unique ID based on timestamp
  newNode.id = nodeId;
  newNode.style.position = "absolute";
  newNode.style.padding = "20px";
  newNode.style.borderWidth = "1px";
  newNode.style.border = "solid 2px red";
  newNode.style.borderRadius = "100%";

  // Set the inner text to the current number
  const nodeStateName = document.getElementById("NodeNameInput").value
  newNode.innerText = nodeStateName;
  mapIdToStateName.set(nodeId, nodeStateName);
  automataDefinition.addState(nodeStateName);

  // Append the new node to the container
  const container = document.getElementById("myDiagramDiv");
  container.appendChild(newNode);

  // Add the node as a new endpoint in jsPlumb
  addNewNode(nodeId);

  // Increment the number and update the input field
  number = number + 1;
  document.getElementById("NodeNameInput").value = `q${number}`; // Update input field with the new number
  
  const option = document.createElement("option");
  option.text = nodeStateName;
  selectElement.add(option);
}

// Example of adding jsPlumb endpoint to new node
function addNewNode(elementId) {
  const node = document.getElementById(elementId);

  if (!node) {
    console.error("Element not found");
    return;
  }

  // Add a new endpoint to a node
  for (anchor of ["Left", "Right"]) {
    instance.addEndpoint(node, {
      target: true,
      source: true,
      endpoints: ["Dot"],
      // anchor: "Perimeter", // Default anchor, will be changed later on each connection
      anchor: anchor,
      // anchor: {
      //   type: "Perimeter",
      //   options: { shape: "Circle", anchorCount: 2000 },
      // },
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

// Bind event to handle new connections and assign unique anchors to each one
instance.bind("connection", function (info) {
  // Prompt for the transition letter
  const transitionLetter = window.prompt("Insira a letra da transição: ");

  const connection = info.connection;
  const sourceId = connection.sourceId;
  const targetId = connection.targetId;
  const sourceStateName = mapIdToStateName.get(sourceId);
  const targetStateName = mapIdToStateName.get(targetId);
  
  automataDefinition.addAlphabet(transitionLetter);
  automataDefinition.addTransition(sourceStateName, transitionLetter, targetStateName);
  console.log(automataDefinition);

  // Add the transition letter as a label to the connection
  const label = connection.getOverlay("Label");
  if (label) {
    label.setLabel(transitionLetter); // Set the transition letter as the label
  } else {
    // If no label overlay exists, create one and set the label
    connection.addOverlay({
      type: "Label",
      options: {
        label: transitionLetter,
        id: `label-${Date.now()}`,
        events: {
          click: (e, o) => alert("click!"),
        },
      },
    });
  }
});
instance.bind("", {});

function setConfigurations(newValue) {
  configurations = newValue;
  document.getElementById("stepButton").disabled = newValue.length === 0;
  // reset html in configurations div
  document.getElementById("configurations").innerHTML = "";
  // map configurations through history
  configurations.forEach((config, index) => {
    const p = document.createElement("p");
    let text = `Configuração ${index + 1}: ${mapEnglishStatusToPortuguese[config.currentStatus]}`;
    config.history.forEach((transition, index) => {
      text += `\n${transition.origin} --(${transition.symbol})--> ${transition.target}`;
    });
    text += `\n${config.currentState}`;
    p.innerText = text;
    document.getElementById("configurations").appendChild(p);
  });
}

function startReading() {
  const initialState = document.getElementById("initStateSelect").value;  
  automataDefinition.setInitialState(initialState)
  automataDefinition.addFinalState("q1", true);
  const initialString = document.getElementById("StringInput").value;
  setConfigurations(automataDefinition.startReadingConfiguration(initialString));
  document.getElementById("stepButton").disabled = false;
  console.log(configurations);
}

function advanceConfigurations() {
  setConfigurations(automataDefinition.advanceMultipleConfigurations(configurations));
  console.log(configurations);
}
