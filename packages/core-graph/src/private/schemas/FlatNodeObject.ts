import { array, minLength, null_, objectWithRest, optional, pipe, string, union, type InferOutput } from 'valibot';

import { IdentifierSchema } from './Identifier';
import { JSONLiteralSchema } from './JSONLiteral';
import { LiteralSchema } from './Literal';
import { NodeReferenceSchema } from './NodeReference';
import freeze from './private/freeze';

const FlatNodeObjectPropertyValueSchema = union(
  [
    pipe(
      array(
        union(
          [LiteralSchema, JSONLiteralSchema, NodeReferenceSchema],
          'Array in flat node must be literal, JSON value, or node reference'
        )
      ),
      freeze()
    ),
    JSONLiteralSchema,
    LiteralSchema,
    NodeReferenceSchema,
    null_()
  ],
  'Non-array value in flat node must be literal, JSON value, node reference, or null'
);

type FlatNodeObjectPropertyValue = InferOutput<typeof FlatNodeObjectPropertyValueSchema>;

/**
 * Schema of JSON-LD node object.
 */
const FlatNodeObjectSchema = pipe(
  objectWithRest(
    {
      '@context': optional(string('Complex @context is not supported in our implementation')),
      '@id': IdentifierSchema,
      '@type': optional(
        union(
          [pipe(array(string()), minLength(1), freeze()), string()],
          '@type must be string or array of string with at least 1 element'
        )
      )
    },
    FlatNodeObjectPropertyValueSchema
  ),
  freeze()
);

type FlatNodeObject = InferOutput<typeof FlatNodeObjectSchema>;

export {
  FlatNodeObjectPropertyValueSchema,
  FlatNodeObjectSchema,
  type FlatNodeObject,
  type FlatNodeObjectPropertyValue
};
