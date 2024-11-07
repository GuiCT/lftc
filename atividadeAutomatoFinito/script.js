jsPlumbContainer = document.getElementById("myDiagramDiv");
console.log(jsPlumb.version); // Logs the jsPlumb version

const instance = jsPlumb.newInstance({
  container: jsPlumbContainer,
  dragOptions: {
    containment: "notNegative",
  },
});

/**
 * @type {Map<string, string>}
 */
const mapIdToStateName = new Map();
const automataDefinition = new AutomataDefinition();

let number = 0;
document.getElementById("NodeNameInput").value = `q${number}`;

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
  debugger;
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

function getStructure() {
  console.log(instance);
  console.log(instance.getConnections());
  console.log(instance.getEndpoints());
}
