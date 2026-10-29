import {
  custom,
  is,
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
      '@context': optional(undefined_('Does not support @context')),
      '@id': identifierSchema,
      '@type': pipe(set(string()), minSize(1, 'Node must have at least one @type')),
      hasPart: optional(pipe(set(nodeReferenceSchema), readonly())),
      isPartOf: optional(pipe(set(nodeReferenceSchema), readonly()))
    },
    custom(value => is(propertyValueSchema, value))
  ),
  readonly()
);

type Node = InferOutput<typeof nodeSchema>;

export { nodeSchema, type Node };
