// @ts-check

/** @import { Transition, AutomataStatus } from './automata' */

/**
 * Direções possíveis sobre a fita
 * @readonly
 * @typedef {('LEFT'|'RIGHT'|'STAY')} HeadDirection 
 */

const DIRECTION_TO_NUMBER = {
    'LEFT': -1,
    'RIGHT': 1,
    'STAY': 0,
}

/**
 * @typedef {Transition & {toWrite: string, direction: HeadDirection }} TapeTransition
 */

/**
 * Configuração de uma máquina de turing, com estado e status atual, fita e histórico de transições.
 */
class TuringConfiguration {
    /**
     * Estado atual
     * @type {string}
     */
    currentState;

    /**
     * Fita a ser processada
     * @type {Array<string>}
     */
    tape;

    /**
     * Posição do cabeçote de E/S
     */
    headPosition;

    /**
     * Status atual
     * @type {AutomataStatus}
     */
    currentStatus;

    /**
     * Histórico de transições
     * @type {Array<TapeTransition & { headPosition: number }>}
     */
    history;

    /**
     * @param {string} currentState
     * @param {Array<string>} tape
     * @param {number} headPosition
     * @param {Array<TapeTransition & { headPosition: number }>} history
     */
    constructor(currentState, tape, headPosition, history) {
        this.currentState = currentState;
        this.tape = tape;
        this.headPosition = headPosition;
        this.currentStatus = "READING";
        this.history = history;
    }

    /**
     * Retorna o caractere atual da fita
     */
    get currentChar() {
        return this.tape[this.headPosition] ?? '';
    }

    /**
     * Realiza a transição da configuração para um novo estado
     * Lida com leitura e escrita de fita
     * @param {TapeTransition} transition
     */
    transitionToState(transition) {
        const newTape = [...this.tape];
        newTape[this.headPosition] = transition.toWrite;
        let newHeadPosition = this.headPosition + DIRECTION_TO_NUMBER[transition.direction];

        const headFurtherLeft = newHeadPosition < 0;
        const headFurtherRight = newHeadPosition >= this.tape.length;

        if (headFurtherLeft) {
            newTape.unshift('');
            newHeadPosition = 0;
        }

        if (headFurtherRight) {
            newTape.push('');
            newHeadPosition = this.tape.length;
        }

        const clone = new TuringConfiguration(
            transition.target,
            newTape,
            newHeadPosition,
            [...this.history, { ...transition, headPosition: this.headPosition }],
        );

        return clone;
    }

    /**
     * Marca a configuração como aceita
     * @returns {this}
     */
    markAsAccepted() {
        this.currentStatus = 'ACCEPTED';
        return this;
    }

    /**
     * Marca a configuração como rejeitada
     * @returns {this}
     */
    markAsRejected() {
        this.currentStatus = 'REJECTED';
        return this;
    }
}

class TuringMachine {
    /**
     * Alfabeto da máquina de turing, conjunto de símbolos aceitos
     * @type {Array<string>}
     */
    alphabet;

    /**
     * Estados da máquina de turing, conjunto de estados
     * @type {Array<string>}
     */
    states;

    /**
     * Conjunto de transições da máquina de turing
     * @type {Array<TapeTransition>}
     */
    transitions;

    /**
     * Estado inicial, único
     * @type {string}
     */
    initialState;

    /**
     * Estados finais, possivelmente múltiplos 
     * @type {Array<string>}
     */
    finalStates;

    constructor() {
        this.alphabet = [''];
        this.states = [];
        this.transitions = [];
        this.initialState = '';
        this.finalStates = [];
    }

    /**
     * Adiciona um símbolo ao alfabeto
     * @param {string} symbol
     */
    addAlphabet(symbol) {
        if (!this.alphabet.includes(symbol)) {
            this.alphabet.push(symbol);
        }
        return this;
    }

    /**
     * Adiciona um estado à máquina de turing
     * @param {string} state
     */
    addState(state) {
        this.states.push(state);
        return this;
    }

    /**
     * Adiciona uma transição à máquina de turing
     * Verifica se os estados e símbolos são válidos
     * 
     * @param {string} origin
     * @param {string} symbol
     * @param {string} target
     * @param {string} toWrite
     * @param {HeadDirection} direction
     * 
     * @throws {Error} Se o símbolo lido não estiver no alfabeto
     * @throws {Error} Se o símbolo escrito não estiver no alfabeto
     * @throws {Error} Se o estado de origem não estiver nos estados
     * @throws {Error} Se o estado de destino não estiver nos estados
     */
    addTransition(origin, symbol, target, toWrite, direction) {
        if (!this.alphabet.includes(symbol)) {
            throw new Error(`Symbol ${symbol} is not in the alphabet`);
        }

        if (!this.alphabet.includes(toWrite)) {
            throw new Error(`Symbol ${toWrite} is not in the alphabet`);
        }

        if (!this.states.includes(origin)) {
            throw new Error(`State ${origin} is not in the states`);
        }

        if (!this.states.includes(target)) {
            throw new Error(`State ${target} is not in the states`);
        }

        /**
         * @type {TapeTransition}
         */
        const newTransition = {
            origin,
            symbol,
            target,
            toWrite,
            direction,
        }

        this.transitions.push(newTransition);
        return this;
    }

    /**
     * Definição do estado inicial
     * @param {string} initialState 
     */
    setInitialState(initialState) {
        if (!this.states.includes(initialState)) {
            throw new Error(`State ${initialState} is not in the states`);
        }
        this.initialState = initialState;
        return this;
    }

    /**
     * Adiciona um estado final à máquina de turing,
     * possivelmente limpando os estados finais anteriores
     * @param {string} state
     * @param {boolean} reset
     */
    addFinalState(state, reset = false) {
        if (reset) {
            this.finalStates = [];
        }

        if (!this.states.includes(state)) {
            throw new Error(`State ${state} is not in the states`);
        }
        this.finalStates.push(state);
        return this;
    }

    /**
     * Instancia uma configuração de leitura da máquina de turing a partir
     * de uma cadeia inicial
     * @param {string} inputString
     */
    startReadingConfiguration(inputString) {
        const tape = inputString.split('');
        const firstConfiguration = new TuringConfiguration(this.initialState, tape, 0, []);
        return [firstConfiguration];
    }

    /**
     * Avança uma configuração da máquina de turing, retornando as novas configurações
     * possíveis a partir da configuração atual
     * @param {TuringConfiguration} configuration
     */
    advanceConfiguration(configuration) {
        const currentLetterConfiguration = configuration.currentChar;

        const possibleTransitions = this.transitions.filter((transition) => {
            const isFromCurrentState = transition.origin === configuration.currentState;
            const isCurrentSymbol = transition.symbol === currentLetterConfiguration;
            return isFromCurrentState && isCurrentSymbol;
        });

        const hasPossibleTransitions = possibleTransitions.length > 0;
        const isInFinalState = this.finalStates.includes(configuration.currentState);

        if (!hasPossibleTransitions) {
            if (isInFinalState) {
                configuration.markAsAccepted();
                return [configuration];
            } else {
                configuration.markAsRejected();
                return [configuration];
            }
        }

        return possibleTransitions.map((transition) => {
            return configuration.transitionToState(transition);
        });
    }

    /**
     * Avança múltiplas configurações da máquina de turing, retornando as novas configurações
     * possíveis a partir das configurações atuais
     * @param {Array<TuringConfiguration>} configurations
     */
    advanceMultipleConfigurations(configurations) {
        return configurations.flatMap((config) => {
            return this.advanceConfiguration(config);
        });
    }

    /**
     * Retorna o status da leitura de um conjunto de configurações
     * da máquina de turing a partir de seus status
     * @param {Array<TuringConfiguration>} configurations
     */
    getStatusFromConfigurations(configurations) {
        const oneIsAccepted = configurations.some((config) => config.currentStatus === "ACCEPTED");
        if (oneIsAccepted) {
            return "ACCEPTED";
        }
        const allAreRejected = configurations.every((config) => config.currentStatus === "REJECTED");
        if (allAreRejected) {
            return "REJECTED";
        }
        return "READING";
    }
}

const firstExampleTuring = new TuringMachine();
firstExampleTuring.addAlphabet('a').addAlphabet('b').addAlphabet('c');
firstExampleTuring.addState('q0').addState('q1').addState('q2');
firstExampleTuring.addTransition('q1', 'b', 'q0', 'b', 'LEFT');
firstExampleTuring.addTransition('q0', '', 'q1', 'a', 'RIGHT');
firstExampleTuring.addTransition('q1', 'b', 'q2', 'b', 'RIGHT');
firstExampleTuring.addTransition('q2', 'c', 'q2', 'c', 'RIGHT');
firstExampleTuring.setInitialState('q1');
firstExampleTuring.addFinalState('q2');

/**
 * #==================== EXEMPLO 1 - Cadeia válida ===================#
 */

let firstExampleValid = firstExampleTuring.startReadingConfiguration('bc');
while (true) {
    const result = firstExampleTuring.advanceMultipleConfigurations(firstExampleValid);
    const status = firstExampleTuring.getStatusFromConfigurations(result);
    if (status !== "READING") {
        console.log("Espera-se ACCEPTED:", status);
        break;
    }
    firstExampleValid = result;
}

/**
 * #==================== EXEMPLO 2 - Cadeia inválida ===================#
 */

let secondExampleInvalid = firstExampleTuring.startReadingConfiguration('cba');
while (true) {
    const result = firstExampleTuring.advanceMultipleConfigurations(secondExampleInvalid);
    const status = firstExampleTuring.getStatusFromConfigurations(result);
    if (status !== "READING") {
        console.log("Espera-se ACCEPTED:", status);
        break;
    }
    secondExampleInvalid = result;
}