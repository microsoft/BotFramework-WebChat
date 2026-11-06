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
 * Sealed by `Exact`: if the schema output has any properties other than `@id`, they will become `never`.
 */
type NodeReference = Exact<{ readonly '@id': Identifier }, InferOutput<typeof nodeReferenceSchema>>;

/**
 * Seals the node reference on TypeScript side: excess properties are rejected even if the value is not an object
 * literal. At runtime, excess properties are rejected by `nodeReferenceSchema`.
 */
type ExactNodeReference<T> = Exact<NodeReference, T>;

export { nodeReferenceSchema, type ExactNodeReference, type NodeReference };
