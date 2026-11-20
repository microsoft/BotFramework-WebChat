import type { Exact } from 'type-fest';
import { pipe, readonly, strictObject, type InferOutput } from 'valibot';
import { identifierSchema, type Identifier } from './NodeIdentifier.ts';

const nodeReferenceSchema = pipe(
  strictObject({ '@id': identifierSchema }, 'Node reference must not contains any properties'),
  readonly()
);

/**
 * A reference to another node, it must only contain `@id`.
 *
 * Sealed by `Exact`: excess properties are rejected on TypeScript side, even if the value is not an object literal,
 * e.g. `<T extends NodeReference<T>>(value: T)`. At runtime, excess properties are rejected by `nodeReferenceSchema`.
 *
 * If `T` is not specified, it is the schema output, which will become `never` if the schema output has any properties
 * other than `@id`.
 */
type NodeReference<T = InferOutput<typeof nodeReferenceSchema>> = Exact<{ readonly '@id': Identifier }, T>;

export { nodeReferenceSchema, type NodeReference };
