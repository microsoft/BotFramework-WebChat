import { boolean, is, number, string, union, type InferOutput } from 'valibot';

/**
 * Schema of JSON-LD literals.
 *
 * @see {@link https://www.w3.org/TR/rdf11-concepts/#dfn-literal RDF 1.1 Concepts and Abstract Syntax: Literals}
 */
const LiteralSchema = union(
  [boolean(), number(), string()],
  'Only boolean, number, and string are allowed for JSON-LD literal'
);

type Literal = InferOutput<typeof LiteralSchema>;

const isLiteral = is.bind(LiteralSchema);

export { isLiteral, LiteralSchema, type Literal };
