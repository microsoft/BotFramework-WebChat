import {
  custom,
  integer,
  is,
  minSize,
  number,
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
      // OPINION: hasPart/isPartOf must reference to another node, not containing another node
      hasPart: optional(pipe(set(nodeReferenceSchema), readonly())),
      isPartOf: optional(pipe(set(nodeReferenceSchema), readonly())),
      // OPINION: position must be an integer and not in a set/array.
      position: optional(
        pipe(number('"position" property value must be integer'), integer('"position" property value must be integer'))
      )
    },
    custom(value => is(propertyValueSchema, value))
  ),
  readonly()
);

type Node = InferOutput<typeof nodeSchema>;

export { nodeSchema, type Node };
