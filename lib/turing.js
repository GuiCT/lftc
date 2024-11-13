// @ts-check

// @ts-expect-error Não importa nesse arquivo
/** @import { AutomataDefinition, Transition } from './automata' */

/**
 * Ações possíveis sobre a fita
 * @readonly
 * @typedef {('READ'|'WRITE'|'NONE')} HeadAction 
 */

/**
 * Direções possíveis sobre a fita
 * @readonly
 * @typedef {('LEFT'|'RIGHT'|'NONE')} HeadDirection 
 */

/**
 * @typedef TapeTransition
 * @prop {Transition} stateTransition
 * @prop {HeadAction} action
 * @prop {HeadDirection} direction
 */

class TuringMachine extends AutomataDefinition {
    /**
     * @type {Array<string>}
     */
    tape;

    /**
     * @type {number}
     */
    head;
}