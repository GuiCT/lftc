// @ts-check
/**
 * Esse arquivo utiliza a diretiva @ts-check para permitir checagem de erros
 * em tempo de compilação, apesar de ser um arquivo JS. Para ele funcionar,
 * é necessário estar utilizando o VSCode ou algum outro editor que suporte a
 * Language Server do TypeScript.
 */

/**
 * @typedef Transition
 * @prop {string} origin
 * @prop {string} symbol
 * @prop {string} target
 */

/**
 * Retorna quantidade de símbolos lidos por uma transição
 * @param {Transition} transition 
 */
function transitionLength(transition) {
    return transition.symbol.length;
}

/**
 * Estado de uma configuração de autômato
 * @readonly
 * @typedef {('ACCEPTED'|'REJECTED'|'READING')} AutomataStatus
 */

/**
 * Configuração de um autômato, com estado e status atual, cadeia a ser lida
 * e histórico de transições.
 */
class AutomataConfiguration {
    /**
     * Estado atual
     * @type {string}
     */
    currentState;

    /**
     * Cadeia a ser lida
     * @type {string}
     */
    remainingRead;

    /**
     * Status atual
     * @type {AutomataStatus}
     */
    currentStatus;

    /**
     * Histórico de transições
     * @type {Array<Transition>}
     */
    history;

    /**
     * @param {string} currentState
     * @param {string} inputString
     * @param {Array<Transition>} history
     */
    constructor(currentState, inputString, history) {
        this.currentState = currentState;
        this.remainingRead = inputString;
        this.currentStatus = "READING";
        this.history = history;
    }

    /**
     * Realiza a transição da configuração para um novo estado
     * Lida com leitura de cadeia e erros de leitura
     * @param {Transition} transition
     */
    transitionToState(transition) {
        let newRemainingRead = this.remainingRead;
        const amountToRead = transitionLength(transition);
        const amountAvailable = this.remainingRead.length;
        const isAbleToRead = amountAvailable >= amountToRead;

        if (!isAbleToRead) {
            return new AutomataConfiguration(
                this.currentState,
                this.remainingRead,
                [...this.history],
            ).markAsRejected();
        }

        newRemainingRead = newRemainingRead.slice(amountToRead);
        const clone = new AutomataConfiguration(
            transition.target,
            newRemainingRead,
            [...this.history, transition],
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

/**
 * Definição de um autômato finito, com alfabeto, estados, transições, estado inicial
 * e estados finais.
 */
class AutomataDefinition {
    /**
     * Alfabeto do autômato, conjunto de símbolos aceitos
     * @type {Array<string>}
     */
    alphabet;

    /**
     * Estados do autômato, conjunto de estados
     * @type {Array<string>}
     */
    states;

    /**
     * Conjunto de transições do autômato
     * @type {Array<Transition>}
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
        this.alphabet = [];
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
     * Adiciona um estado ao autômato
     * @param {string} state
     */
    addState(state) {
        this.states.push(state);
        return this;
    }

    /**
     * Adiciona uma transição ao autômato
     * Verifica se os estados e símbolos são válidos
     * 
     * @param {string} origin
     * @param {string} symbol
     * @param {string} target
     * 
     * @throws {Error} Se o símbolo não estiver no alfabeto
     * @throws {Error} Se o estado de origem não estiver nos estados
     * @throws {Error} Se o estado de destino não estiver nos estados
     */
    addTransition(origin, symbol, target) {
        if (!this.alphabet.includes(symbol)) {
            throw new Error(`Symbol ${symbol} is not in the alphabet`);
        }

        if (!this.states.includes(origin)) {
            throw new Error(`State ${origin} is not in the states`);
        }

        if (!this.states.includes(target)) {
            throw new Error(`State ${target} is not in the states`);
        }

        /**
         * @type {Transition}
         */
        const newTransition = {
            origin,
            symbol,
            target,
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
     * Adiciona um estado final ao autômato,
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
     * Instancia uma configuração de leitura do autômato a partir
     * de uma cadeia inicial
     * @param {string} inputString
     */
    startReadingConfiguration(inputString) {
        const firstConfiguration = new AutomataConfiguration(this.initialState, inputString, []);
        return [firstConfiguration];
    }

    /**
     * Avança uma configuração do autômato, retornando as novas configurações
     * possíveis a partir da configuração atual
     * @param {AutomataConfiguration} configuration
     */
    advanceConfiguration(configuration) {
        const possibleTransitions = this.transitions.filter((transition) => {
            const isFromCurrentState = transition.origin === configuration.currentState;
            const startsWithSymbol = configuration.remainingRead.startsWith(transition.symbol);
            return isFromCurrentState && startsWithSymbol;
        });

        const hasPossibleTransitions = possibleTransitions.length > 0;
        const isInFinalState = this.finalStates.includes(configuration.currentState);
        const hasRemainingRead = configuration.remainingRead.length > 0;

        if (!hasPossibleTransitions) {
            if (isInFinalState && !hasRemainingRead) {
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
     * Avança múltiplas configurações do autômato, retornando as novas configurações
     * possíveis a partir das configurações atuais
     * @param {Array<AutomataConfiguration>} configurations
     */
    advanceMultipleConfigurations(configurations) {
        return configurations.flatMap((config) => {
            return this.advanceConfiguration(config);
        });
    }

    /**
     * Retorna o status da leitura de um conjunto de configurações
     * do autômato a partir de seus status
     * @param {Array<AutomataConfiguration>} configurations
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

/**
 * #==================== EXEMPLO 1 ===================#
 * 
 * Um autômato que lê qualquer cadeia começando com um algarismo de 0 à 9,
 * repete qualquer quantidade de vezes todos os outros algarismos que não aquele,
 * e por fim, encerra no mesmo algarismo que iniciou a cadeia.
 * 
 * #=================================================#
 */
const automataTest = new AutomataDefinition()
    .addState('qS')
    .addState('qF')
    .setInitialState('qS')
    .addFinalState('qF');

for (let i = 0; i < 10; i++) {
    const thisState = `q${i.toString()}`;
    automataTest.addAlphabet(i.toString())
        .addState(thisState)
        .addTransition(
            'qS',
            i.toString(),
            thisState,
        );
    for (let j = 0; j < 10; j++) {
        if (j === i) {
            continue;
        }

        automataTest.addAlphabet(j.toString())
            .addTransition(
                thisState,
                j.toString(),
                thisState,
            );
    }
    automataTest.addTransition(
        thisState,
        i.toString(),
        'qF',
    );
}

/**
 * #==================== EXEMPLO 1 - Cadeia válida ===================#
 */
let firstExampleAccepted = automataTest.startReadingConfiguration('5019283746789321092834767643287091623845');

while (true) {
    const result = automataTest.advanceMultipleConfigurations(firstExampleAccepted);
    const status = automataTest.getStatusFromConfigurations(result);
    if (status !== "READING") {
        console.log("Espera-se ACCEPTED:", status);
        break;
    }
    firstExampleAccepted = result;
}

/**
 * #==================== EXEMPLO 2 - Cadeia inválida ===================#
 * 
 * Após o segundo 3, ainda tem outros algarismos por ler
 */
let firstExampleRefused = automataTest.startReadingConfiguration('39992878392920');

while (true) {
    const result = automataTest.advanceMultipleConfigurations(firstExampleRefused);
    const status = automataTest.getStatusFromConfigurations(result);
    if (status !== "READING") {
        console.log("Espera-se REJECTED:", status);
        break;
    }
    firstExampleRefused = result;
}