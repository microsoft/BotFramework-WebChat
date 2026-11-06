import {
  custom,
  is,
  isoTimestamp,
  minSize,
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
import { propertyValueSchema } from './PropertyValue.ts';

const nodeSchema = pipe(
  objectWithRest(
    {
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
    },
    custom(value => is(propertyValueSchema, value))
  ),
  readonly()
);

type Node = InferOutput<typeof nodeSchema>;

export { nodeSchema, type Node };
