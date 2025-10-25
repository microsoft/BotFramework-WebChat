import { pipe, safeParse, startsWith, string, type ErrorMessage, type GenericSchema, type InferOutput } from 'valibot';

/**
 * Schema of JSON-LD blank node identifier. Must be prefixed with `_:`.
 *
 * @param message
 * @returns
 */
function blankNodeIdentifier<TMessage extends ErrorMessage<any>>(message?: TMessage | undefined) {
  return pipe(string(message), startsWith('_:', message)) as GenericSchema<`_:${string}`>;
}

type BlankNodeIdentifier = InferOutput<ReturnType<typeof blankNodeIdentifier>>;

function isBlankNodeIdentifier(identifier: string): identifier is BlankNodeIdentifier {
  return safeParse(blankNodeIdentifier(), identifier).success;
}

export default blankNodeIdentifier;
export { isBlankNodeIdentifier, type BlankNodeIdentifier };
