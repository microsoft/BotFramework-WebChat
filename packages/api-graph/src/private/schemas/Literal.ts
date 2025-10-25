import { boolean, null_, number, string, union, type ErrorMessage, type InferOutput } from 'valibot';

/**
 * Schema of JSON-LD literals.
 *
 * @param message
 * @returns
 */
function literal<TMessage extends ErrorMessage<any>>(message?: TMessage | undefined) {
  return union([boolean(), null_(), number(), string()], message);
}

type Literal = InferOutput<ReturnType<typeof literal>>;

export { literal, type Literal };
