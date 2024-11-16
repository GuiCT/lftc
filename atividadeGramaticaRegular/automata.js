/** @import {*} from 'atividadeGramaticaRegular\grammar.js' */
// A=({Q},Σ,δ,q0,{F})
// Conjunto de estados finitos
// Alfabeto de entrada
// Função transição
// Estado inicial
// Conjunto de estados finais ou de aceitacao

// class automata{
// // Usage automata(q0,"a",q1)?
// // Usage automata(q0,"b",q2)?

//     constructor(state,input,transition){
//         this.state = state
//         this.input = input
//         this.transition = transition
//     }

// }


class FiniteAutomaton {
    constructor() {
      this.states = new Set(); // Set of states
      this.alphabet = new Set(); // Set of input symbols
      this.transitions = new Map(); // Transition map {state: {symbol: [nextStates]}}
      this.startState = null; // Start state
      this.acceptStates = new Set(); // Set of accept states
    }
  
    // Add a state to the automaton
    addState(state, isStart = false, isAccept = false) {
      this.states.add(state);
      if (isStart) this.startState = state;
      if (isAccept) this.acceptStates.add(state);
      if (!this.transitions.has(state)) {
        this.transitions.set(state, new Map());
      }
    }
  
    // Add a transition (state, symbol -> nextState)
    addTransition(state, symbol, nextState) {
      if (!this.states.has(state) || !this.states.has(nextState)) {
        throw new Error("States must be added before defining transitions.");
      }
      this.alphabet.add(symbol);
      if (!this.transitions.get(state).has(symbol)) {
        this.transitions.get(state).set(symbol, []);
      }
      this.transitions.get(state).get(symbol).push(nextState);
    }
  
    // Simulate the automaton (for DFA or NFA)
    simulate(input) {
      const result = this._simulateNFA([this.startState], input, 0);
      return result.includes(true);
    }
  
    // Internal recursive simulation for NFA
    _simulateNFA(currentStates, input, position) {
      if (position === input.length) {
        return currentStates.map((state) => this.acceptStates.has(state));
      }
  
      const nextSymbol = input[position];
      let nextStates = new Set();
  
      for (let state of currentStates) {
        const transitions = this.transitions.get(state);
        if (transitions && transitions.has(nextSymbol)) {
          transitions.get(nextSymbol).forEach((nextState) => nextStates.add(nextState));
        }
      }
  
      if (nextStates.size === 0) return [false];
  
      return this._simulateNFA(Array.from(nextStates), input, position + 1);
    }
  
    // Display the automaton details
    displayAutomaton() {
      console.log("States: " + Array.from(this.states).join(", "));
      console.log("Alphabet: " + Array.from(this.alphabet).join(", "));
      console.log("Start State: " + this.startState);
      console.log("Accept States: " + Array.from(this.acceptStates).join(", "));
      console.log("Transitions:");
      this.transitions.forEach((map, state) => {
        map.forEach((nextStates, symbol) => {
          console.log(`  ${state} -- ${symbol} --> ${nextStates.join(", ")}`);
        });
      });
    }
  }
  
  // Example: DFA for strings ending in "01"
  const automaton = new FiniteAutomaton();
  
  // Add states
  automaton.addState("q0", true); // Start state
  automaton.addState("q1");
  automaton.addState("q2", false, true); // Accept state
  
  // Add transitions
  automaton.addTransition("q0", "0", "q1");
  automaton.addTransition("q0", "1", "q0");
  automaton.addTransition("q1", "0", "q1");
  automaton.addTransition("q1", "1", "q2");
  automaton.addTransition("q2", "0", "q1");
  automaton.addTransition("q2", "1", "q0");
  
  // Display automaton details
  automaton.displayAutomaton();
  
  // Simulate the automaton
  console.log("Accepts '01'? ", automaton.simulate("01")); // true
  console.log("Accepts '001'? ", automaton.simulate("001")); // false
  console.log("Accepts '101'? ", automaton.simulate("101")); // true
  