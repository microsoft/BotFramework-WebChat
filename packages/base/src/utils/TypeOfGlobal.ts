/**
 * Type of a global, or `Fallback` if the consumer's global types do not declare it.
 *
 * Use this instead of `typeof X` in published typings when `X` is not in TypeScript's DOM library, e.g. `setImmediate`
 * (Node.js types) or `SpeechRecognition` (`@types/dom-speech-recognition`), so consumers without these types do not get
 * "Cannot find name".
 */
type TypeOfGlobal<Name extends string, Fallback> = typeof globalThis extends Record<Name, infer T> ? T : Fallback;

export { type TypeOfGlobal };
