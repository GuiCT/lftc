/** @import {*} from 'script' */

// Function to add a new node dynamically
function addNodeConvertion(stateName) {
  // Create a new div element
  const newNode = document.createElement("div");

  // Set an ID and class for the new node
  // As the nodes are generated in order, using timestamp only is a bad idea
  const nodeId = `node-${Date.now()}-${stateName}`;
  newNode.id = nodeId;
  newNode.style.position = "absolute";
  newNode.style.padding = "3rem";
  newNode.style.borderWidth = "1px";
  newNode.style.border = "solid 2px red";
  newNode.style.borderRadius = "100%";
  newNode.style.fontSize = "2rem";
  // random position
  newNode.style.left = `${Math.floor(Math.random() * 80)}%`;
  newNode.style.top = `${Math.floor(Math.random() * 80)}%`;

  // Set the inner text to the current number
  newNode.innerText = stateName;
  mapIdToStateName.set(nodeId, stateName);

  // Append the new node to the container
  const container = document.getElementById("myDiagramDiv");
  container.appendChild(newNode);

  // Add the node as a new endpoint in jsPlumb
  addNewNode(nodeId);
  syncStates();
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

function automataToGrammar() {
  const initialStateId = document.getElementById("initStateSelect").value;
  const initialState = mapIdToStateName.get(initialStateId);
  const finalStates = Array.from(
    document.getElementById("finalStatesSelect").selectedOptions
  ).map((stateId) => mapIdToStateName.get(stateId.value));
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
  console.log(automataDefinition);
  window.sessionStorage.setItem(
    "automataToGrammar",
    JSON.stringify(automataDefinition)
  );

  const currentHref = window.location.href;
  // window.sessionStorage.setItem("automataToGrammar", null);
  let newPath = currentHref.substring(0, currentHref.lastIndexOf("/"));
  newPath = newPath.substring(0, newPath.lastIndexOf("/"));
  newPath += "/atividadeGramaticaRegular/index.html";
  window.location.href = newPath;
  // }
}

if (sessionStorage.getItem("regexToAutomata")) {
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
  for (const finalStates in automata.finalStates) {
    Array.from(finalStatesSelect.options).forEach((option) => {
      if (
        option.value ===
        findKeyByValue(mapIdToStateName, automata.finalStates[finalStates])
      )
        option.selected = findKeyByValue(
          mapIdToStateName,
          automata.finalStates[finalStates]
        );
    });
  }

  console.log(automata);
  window.sessionStorage.removeItem("grammarToAutomata");
}
