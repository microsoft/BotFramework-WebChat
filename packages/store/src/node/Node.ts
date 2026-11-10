import {
  isoTimestamp,
  minSize,
  object,
  objectWithRest,
  optional,
  pipe,
  readonly,
  set,
  string,
  undefined_,
  type InferOutput
} from 'valibot';
import { identifierSchema } from './NodeIdentifier.ts';
import { nodeReferenceSchema } from './NodeReference.ts';
import { propertyValueSchema, type PropertyValue } from './PropertyValue.ts';

const namedPropertiesSchema = object({
  // OPINION: For simplification, we assume all types/properties is based on https://schema.org unless specified.
  '@context': optional(undefined_('Does not support @context')),
  // OPINION: Each node can has a single ID only.
  '@id': identifierSchema,
  '@type': pipe(set(string()), minSize(1, 'Node must have at least one @type')),
  // OPINION: dateCreated must be an ISO timestamp string with time zone and not in a set/array.
  dateCreated: optional(
    pipe(
      string('"dateCreated" property value must be an ISO timestamp string'),
      isoTimestamp('"dateCreated" property value must be an ISO timestamp string')
    )
  ),
  // OPINION: hasPart/isPartOf must reference to another node, not containing another node
  hasPart: optional(pipe(set(nodeReferenceSchema), readonly())),
  isPartOf: optional(pipe(set(nodeReferenceSchema), readonly()))
});

const nodeSchema = pipe(
  objectWithRest(
    namedPropertiesSchema.entries,
    // The output of `propertyValueSchema` must be used as it is transformed, e.g. JSON literal as `JSON.stringify()`.
    propertyValueSchema
  ),
  readonly()
);

type NamedProperties = InferOutput<typeof namedPropertiesSchema>;

/**
 * A node, for reading.
 *
 * Named properties (e.g. `@id`, `@type`) are typed as-is, all other properties are `PropertyValue`.
 *
 * As named properties are not `PropertyValue`, TypeScript cannot express "all other properties" without an index
 * signature conflicting with named properties. Thus, an object literal cannot be assigned to `Node` directly, use
 * `NodeInit<T>` to validate an object literal instead.
 */
type Node = InferOutput<typeof nodeSchema>;

/**
 * Validates `T` as a node, for writing, e.g. `<T>(node: NodeInit<T>)`.
 *
 * - Named properties (e.g. `@id`, `@type`) must be of their respective types, required ones must be present
 * - All other properties must be `PropertyValue`, e.g. `text: ['Hello']` instead of `text: 'Hello'`
 *
 * At runtime, the node is validated by `nodeSchema`.
 */
type NodeInit<T> = T &
  Readonly<NamedProperties> & {
    readonly [K in keyof T]: K extends keyof NamedProperties ? NamedProperties[K] : PropertyValue;
  };

export { nodeSchema, type Node, type NodeInit };
