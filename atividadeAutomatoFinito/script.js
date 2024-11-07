jsPlumbContainer = document.getElementById("myDiagramDiv");
// jsPlumb.ready(function () {
const instance = jsPlumb.newInstance({
  container: jsPlumbContainer,
  dragOptions: {
    containment: "notNegative",
  },
});
// });

// Add double-click event handler to the jsPlumb instance
instance.bind("click", (endpoint) => {
  console.log("aaaaaaa");
});

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
  newNode.innerText = document.getElementById("NodeNameInput").value;

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
  if (node) {
    instance.addEndpoint(node, {
      target: true,
      source: true,
      endpoints: ["Dot"],
      // reattachConnections: true,
      // anchor: "AutoDefault",
      // anchor: "Continuous",
      anchor: { type: "Perimeter", options: { shape: "Circle" } },
      // connector: "Straight",

      connectorOverlays: [
        { type: "PlainArrow", options: { location: 1 } },
        { type: "Label", options: { label: "", id: `label-${Date.now()}` } },
      ],
    });
  }
}

// const ep1 = instance.addEndpoint(document.getElementById("circle1"), {
//   target: true,
//   source: true,
//   endpoint: "Dot",
//   anchor: "AutoDefault",
//   connector: "Straight",
// });
// const ep2 = instance.addEndpoint(document.getElementById("circle2"), {
//   target: true,
//   source: true,
//   endpoint: "Dot",
//   anchor: "AutoDefault",
//   connector: "Straight",
// });
// const ep3 = instance.addEndpoint(document.getElementById("circle3"), {
//   target: true,
//   source: true,
//   endpoint: "Dot",
//   anchor: "AutoDefault",
//   connector: "Straight",
// });

// instance.connect({
//   source: ep1,
//   target: ep2,
//   // anchor: "AutoDefault",
//   // endpoints: ["Dot", "Blank"],
//   overlays: [
//     // { type:"Arrow", options:{location:1}},
//     {
//       type: "Label",
//       options: { label: "foo", location: 50 },
//     },
//   ],
// });
