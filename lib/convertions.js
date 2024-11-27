// @ts-check
/**
 * @import {Transition} from './automata.js'
 */

/**
 * @typedef {Object} StoredRegex
 * @property {string} regex
 */

/**
 * @typedef {Array<string>} StoredGrammar
 */

/**
 * @typedef {Object} storedAutomata
 * @property {Array<string>} alphabet
 * @property {Array<string>} states
 * @property {Array<Transition>} transitions
 * @property {string} initialState
 * @property {Array<string>} finalStates
 */

const stateWithNumberRegex = /S(\d+)/g;

/**
 * @param {Array<string>} states
 * @returns {number}
 */
function getNextAvailableStateNumber(states) {
  let stateCounter = 1;
  while (states.includes(`S${stateCounter}`)) {
    stateCounter++;
  }
  return stateCounter;
}

/**
 * @param {Array<string>} rules
 */
function getStatesFromRules(rules) {
  const states = new Set();
  for (const rule of rules) {
    const [state, _] = rule.split(" -> ").map((str) => str.trim());
    states.add(state);
  }
  return Array.from(states);
}

/**
 * Realiza o parse de um grupo de uma expressão regular e retorna os grupos separados por |.
 * No entanto, caso exista um sub-grupo, esse operador não é aplicado.
 * Essa função é necessária para fazer a conversão de grupos aninhados de forma recursiva.
 *
 * ---
 *
 * Parses a group of a regular expression and returns the groups separated by |.
 * However, if there is a sub-group, this operator is not applied.
 * This function is necessary to convert nested groups recursively.
 * @param {string} regExpGroup
 * @returns {Array<string>} Possíveis grupos de uma expressão regular.
 * Possible groups of a regular expression.
 *
 * ---
 *
 * @example getGroupUnions("a|b") // ["a", "b"]
 * @example getGroupUnions("a|(b|c)") // ["a", "(b|c)"]
 */
function getGroupUnions(regExpGroup) {
  let groupUnions = [];
  let subGroup = "";
  let openParentheses = 0;

  for (let j = 0; j < regExpGroup.length; j++) {
    const groupChar = regExpGroup[j];
    if (groupChar === "(") {
      openParentheses++;
    } else if (groupChar === ")") {
      openParentheses--;
    }

    if (groupChar === "|" && openParentheses === 0) {
      groupUnions.push(subGroup);
      subGroup = "";
    } else {
      subGroup += groupChar;
    }
  }

  if (subGroup) {
    groupUnions.push(subGroup);
  }

  return groupUnions;
}

/**
 * @param {string} regexDefinition
 * @param {string} startState
 * @param {Array<string>} states
 * @returns {Array<string>}
 */
function regexToGrammar(regexDefinition, startState = "S", states = []) {
  try {
    new RegExp(regexDefinition);
  } catch (error) {
    throw new Error("Invalid regex.");
  }

  /**
   * @type {Array<string>}
   */
  let rules = [];
  let stateCounter = getNextAvailableStateNumber(states);
  let currentState = startState;
  /**
   * @type {Array<string>}
   */
  const stack = [];

  if (regexDefinition.startsWith("^") && regexDefinition.endsWith("$")) {
    // Remove the start and end anchors
    regexDefinition = regexDefinition.replace(/^(\^)?(.*?)(\$)?$/, "$2");
  }

  for (let i = 0; i < regexDefinition.length; i++) {
    const char = regexDefinition[i];

    if (char === "(") {
      // We know that this needs to be closed somewhere
      // (otherwise the RegExp would fail)
      // Then, parse the whole group instead of reading char by char
      // debugger;
      const regexFromHere = regexDefinition.slice(i + 1);
      const groupEnd = regexFromHere.lastIndexOf(")");
      const group = regexFromHere.slice(0, groupEnd);
      const groupUnions = getGroupUnions(group);

      /**
       * @type {Array<string>}
       */
      const endingRules = [];

      for (const groupUnion of groupUnions) {
        const lhsStates = getStatesFromRules(rules);
        const allStates = [...lhsStates, currentState];
        const groupRules = regexToGrammar(groupUnion, currentState, allStates);
        const endingRule = groupRules[groupRules.length - 1];
        endingRules.push(endingRule);
        rules.push(...groupRules);
      }

      stateCounter = getNextAvailableStateNumber(getStatesFromRules(rules));
      const nextState = `S${stateCounter++}`;

      rules = rules.map((rule) => {
        const isEndingRule = endingRules.includes(rule);
        if (!isEndingRule) {
          return rule;
        }

        const lhs = rule.split(" -> ")[0];
        return `${lhs} -> ${nextState}`;
      });

      stack.push(currentState);
      currentState = nextState;
      i += groupEnd + 1;
    } else if (char === "*") {
      if (stack.length === 0) {
        throw new Error("Invalid regex.");
      }

      const lastState = stack.pop();
      rules.push(`${currentState} -> ${lastState}`);
    } else {
      // For regular characters, create a new transition and state
      const nextState = `S${stateCounter++}`;

      rules.push(`${currentState} -> ${char} ${nextState}`);
      stack.push(currentState);
      currentState = nextState;
    }
  }

  // Final state transition to λ
  rules.push(`${currentState} -> λ`);

  return rules;
}

/**
 * @param {string} state
 */
function stateToLetter(state) {
  const number = parseInt(state.substring(1)) - 1;
  if (number > 25) {
    throw new Error("State number is too high.");
  }
  return String.fromCharCode(65 + number);
}

/**
 * @param {Array<string>} rules
 */
function changeStatesToLetters(rules) {
  return rules.map((rule) => {
    const result = rule.replaceAll(stateWithNumberRegex, (match) => {
    //   debugger;
      return stateToLetter(match);
    });
    return result;
  });
}

/**
 * @param {Array<string>} grammarDefinition
 */
function grammarToRegex(grammarDefinition) {
  let regex = "";
  const startState = grammarDefinition[0].split(" -> ")[0];
  const endState =
    grammarDefinition[grammarDefinition.length - 1].split(" -> ")[0];

  // Create a map of transitions
  const transitions = {};
  for (const rule of grammarDefinition) {
    const [state, transition] = rule.split(" -> ");
    if (!transitions[state]) {
      transitions[state] = [];
    }
    transitions[state].push(transition);
  }

  // Helper function to recursively build regex
  function buildRegex(state) {
    const stateTransitions = transitions[state];
    if (!stateTransitions) {
      return "";
    }

    let regex = "";
    for (const transition of stateTransitions) {
      const [char, nextState] = transition.split(" ");
      if (char === "λ") {
        regex += buildRegex(nextState);
      } else {
        regex += char;
        regex += buildRegex(nextState);
      }
    }

    return regex;
  }

  // Build the regex from the start state
  regex = buildRegex(startState);

  return "^" + regex + "$";
}

/**
 * @param {Array<string>} grammarDefinition
 */
function grammarToAutomata(grammarDefinition) {
  /**
   * @type {Set<string>}
   */
  const alphabet = new Set();
  /**
   * @type {Set<string>}
   */
  const states = new Set();
  /**
   * @type {Array<{origin: string, target: string, symbol: string}>}
   */
  const transitions = [];
  /**
   * @type {Set<string>}
   */
  const finalStates = new Set();
  /**
   * @type {Object<string, Array<string>>}
   */
  const transitionMap = {};

  // Parse the grammar rules into a transition map
  for (const rule of grammarDefinition) {
    const [state, transition] = rule.split(" -> ");
    if (!transitionMap[state]) {
      transitionMap[state] = [];
    }
    transitionMap[state].push(transition);
  }

  // Helper function to recursively build the automata
  const visited = new Set();

  function buildAutomata(state) {
    if (visited.has(state)) return;
    visited.add(state);

    const stateTransitions = transitionMap[state];
    if (!stateTransitions) return;

    for (const transition of stateTransitions) {
      states.add(state);

      if (transition === "λ") {
        // Handle λ transition (final state case)
        finalStates.add(state);
      } else {
        const char = transition[0];
        const nextState = transition.slice(1);

        // Add transitions and update sets
        alphabet.add(char);
        states.add(nextState);
        transitions.push({ origin: state, target: nextState, symbol: char });

        // Recursive call
        buildAutomata(nextState);
      }
    }
  }

  // Build the automata from the start state
  const initialState = grammarDefinition[0].split(" -> ")[0];
  buildAutomata(initialState);

  // Return the automaton
  return {
    alphabet: Array.from(alphabet),
    states: Array.from(states),
    transitions,
    initialState,
    finalStates: Array.from(finalStates),
  };
}

// // Example usage:
// const grammarDefinition = ["S -> aA", "A -> λ"];
// const automata = grammarToAutomata(grammarDefinition);
// console.log(JSON.stringify(automata, null, 2));
