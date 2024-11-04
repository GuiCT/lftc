// @ts-check

class AutomataConfiguration {
    /**
     * @type {string}
     */
    currentState;

    /**
     * @type {string}
     */
    remainingRead;

    /**
     * @type {number}
     */
    currentStatus;

    /**
     * @param {string} currentState
     * @param {string} inputString
     */
    constructor(currentState, inputString) {
        this.currentState = currentState;
        this.remainingRead = inputString;
        this.currentStatus = 0;
    }

    /**
     * @param {string} newState
     * @param {boolean} read
     */
    transitionToState(newState, read) {
        let newRemainingRead = this.remainingRead;
        if (read && this.remainingRead.length > 0) {
            newRemainingRead = this.remainingRead.substring(1);
        }
        const clone = new AutomataConfiguration(newState, newRemainingRead);
        return clone;
    }

    markAsAccepted() {
        this.currentStatus = 1;
    }

    markAsRejected() {
        this.currentStatus = -1;
    }
}


class AutomataDefinition {
    /**
     * @type {Array<string>}
     */
    alphabet;

    /**
     * @type {Array<string>}
     */
    states;

    /**
     * @type {Map<string, Map<string, Array<string>>>}
     */
    transitions;

    /**
     * @type {string}
     */
    initialState;

    /**
     * @type {Array<string>}
     */
    finalStates;

    constructor() {
        this.alphabet = [];
        this.states = [];
        this.transitions = new Map();
        this.initialState = '';
        this.finalStates = [];
    }

    /**
     * @param {string} symbol
     */
    addAlphabet(symbol) {
        this.alphabet.push(symbol);
        return this;
    }

    /**
     * @param {string} state
     */
    addState(state) {
        this.states.push(state);
        return this;
    }

    /**
     * @param {string} from
     * @param {string} symbol
     * @param {string} to
     */
    addTransition(from, symbol, to) {
        /** @type {Map<string, Array<string>> | undefined} */
        let currentFrom = this.transitions.get(from);

        if (!currentFrom) {
            currentFrom = new Map();
        }

        const currentTo = currentFrom.get(symbol) || [];
        if (!currentTo.includes(to)) {
            currentTo.push(to);
        }
        currentFrom.set(symbol, currentTo);
        this.transitions.set(from, currentFrom);
        return this;
    }

    /**
     * @param {string} initialState 
     */
    setInitialState(initialState) {
        this.initialState = initialState;
        return this;
    }

    /**
     * @param {string} state
     */
    addFinalState(state) {
        this.finalStates.push(state);
        return this;
    }

    startReadingConfiguration(inputString) {
        const firstConfiguration = new AutomataConfiguration(this.initialState, inputString);
        return [firstConfiguration];
    }

    /**
     * @param {AutomataConfiguration} configuration
     */
    advanceConfiguration(configuration) {
        const hasSomethingToRead = configuration.remainingRead.length > 0;
        const isInFinalState = this.finalStates.includes(configuration.currentState);

        if (!hasSomethingToRead) {
            if (isInFinalState) {
                configuration.markAsAccepted();
                return [configuration];
            } else {
                configuration.markAsRejected();
                return [configuration];
            }
        }

        const transitionMap = this.transitions.get(configuration.currentState);

        if (!transitionMap) {
            configuration.markAsRejected();
            return [configuration];
        }

        const currentFrom = transitionMap.get(configuration.remainingRead[0]);
        if (!currentFrom) {
            configuration.markAsRejected();
            return [configuration];
        }

        if (currentFrom.length === 0) {
            configuration.markAsRejected();
            return [configuration];
        }

        return currentFrom.map((to) => configuration.transitionToState(to, true));
    }
}

const automataTest = new AutomataDefinition()
    .addAlphabet('0')
    .addAlphabet('1')
    .addState('q0')
    .addState('q1')
    .addState('q2')
    .addTransition('q0', '0', 'q1')
    .addTransition('q1', '1', 'q2')
    .addTransition('q2', '1', 'q2')
    .setInitialState('q0')
    .addFinalState('q2');

let configurations = automataTest.startReadingConfiguration('01');
// loop all configurations in array until one is true or all are false
while (true) {
    const newConfigurations = configurations.flatMap((config) => {
        return automataTest.advanceConfiguration(config);
    });
    const oneIsAccepted = newConfigurations.some((config) => config.currentStatus === 1);
    if (oneIsAccepted) {
        console.log('Accepted');
        break;
    }
    const allAreRejected = newConfigurations.every((config) => config.currentStatus === -1);
    if (allAreRejected) {
        console.log('Rejected');
        break;
    }
    configurations = newConfigurations;
}