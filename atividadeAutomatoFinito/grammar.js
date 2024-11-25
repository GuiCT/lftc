/** @import {*} from 'script' */
let position=0
// Function to add a new node dynamically
function addNodeConvertion(stateName) {
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
  newNode.style.left = `${position}px`

  // Set the inner text to the current number
  // const nodeStateName = document.getElementById("NodeNameInput").value;
  newNode.innerText = stateName;
  mapIdToStateName.set(nodeId, stateName);

  // Append the new node to the container
  const container = document.getElementById("myDiagramDiv");
  container.appendChild(newNode);

  // Add the node as a new endpoint in jsPlumb
  addNewNode(nodeId);
  syncStates();
  position+=250
}

function connection(source, target, transition) {
  console.log(findKeyByValue(mapIdToStateName, source));

  console.log(
    document.getElementById(findKeyByValue(mapIdToStateName, source))
  );

  instance.connect({
    source: document.getElementById(findKeyByValue(mapIdToStateName, source)),
    target: document.getElementById(findKeyByValue(mapIdToStateName, target)),
    anchor: ["Left", "Right"],
    connector: "Bezier",
    overlays: [
      { type: "PlainArrow", options: { location: 1 } },
      {
        type: "Label",
        options: {
          label: transition,
          id: `label-${Date.now()}`,
          cssClass: "customLabel",
        },
      },
    ],
    doNotFireConnectionEvent: true,
  });
}

/**
 * Finds the key in a Map that corresponds to a given value.
 * @param {Map} map - The Map object to search.
 * @param {*} valueToFind - The value to search for in the Map.
 * @returns {*} - The key associated with the value, or null if not found.
 */
function findKeyByValue(map, valueToFind) {
  for (const [key, value] of map) {
    if (value === valueToFind) {
      return key; // Return the key when the value matches
    }
  }
  return null; // Return null if no match is found
}

if (sessionStorage.getItem("grammarToAutomata")) {
  const grammar = JSON.parse(sessionStorage.getItem("grammarToAutomata"));
  console.log(grammar);
  const automata = grammarToAutomata(grammar);
  for (const state in Array.from(automata.states)) {
    addNodeConvertion(automata.states[state]);
  }

  for (const transition in automata.transitions) {
    connection(
      automata.transitions[transition].origin,
      automata.transitions[transition].target,
      automata.transitions[transition].symbol
    );
    
  }

  const finalStatesSelect = document.getElementById("finalStatesSelect");
  for(const finalStates in automata.finalStates){
    Array.from(finalStatesSelect.options).forEach(option => {
      if(option.value===findKeyByValue(mapIdToStateName,automata.finalStates[finalStates]))
    option.selected = findKeyByValue(mapIdToStateName,automata.finalStates[finalStates])
    
   });
  }
 

  console.log(automata);
  // window.sessionStorage.clear();
}
