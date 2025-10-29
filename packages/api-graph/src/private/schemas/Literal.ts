import { boolean, number, safeParse, string, union, type ErrorMessage, type InferOutput } from 'valibot';

/**
 * Schema of JSON-LD literals.
 *
 * @param message
 * @returns
 */
function literal<TMessage extends ErrorMessage<any>>(message?: TMessage | undefined) {
  // TODO: [P*] Null should not be literal because it could become null[].
  return union([boolean(), number(), string()], message);
}

type Literal = InferOutput<ReturnType<typeof literal>>;

function isLiteral(value: unknown): value is Literal {
  return safeParse(literal(), value).success;
}

export { isLiteral, literal, type Literal };
