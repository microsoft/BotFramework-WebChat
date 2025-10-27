import {
  array,
  lazy,
  objectWithRest,
  optional,
  pipe,
  string,
  transform,
  union,
  type ErrorMessage,
  type GenericSchema
} from 'valibot';

import identifier, { type Identifier } from './Identifier';
import { literal, type Literal } from './Literal';
import freeze from './private/freeze';

type Input = {
  '@context'?: string | undefined;
  '@id'?: Identifier | undefined;
  '@type'?: string | undefined;
} & {
  [key: string]: Literal | Input | (Literal | Input)[];
};

type NodeObject = {
  readonly '@context'?: string | undefined;
  readonly '@id'?: Identifier | undefined;
  readonly '@type'?: string | undefined;
} & {
  readonly [key: string]: readonly (Literal | NodeObject)[];
};

/**
 * Schema of JSON-LD node object.
 *
 * When parsed, all property value will be wrapped in an array.
 *
 * @param message
 * @returns
 */
function nodeObject<TMessage extends ErrorMessage<any>>(
  message?: TMessage | undefined
): GenericSchema<Input, NodeObject> {
  return pipe(
    objectWithRest(
      {
        '@context': optional(string()),
        '@id': optional(identifier()),
        '@type': optional(string())
      },
      union([
        pipe(array(lazy(() => nodeObject())), freeze()),
        pipe(array(literal()), freeze()),
        pipe(
          lazy(() => nodeObject()),
          transform<NodeObject, readonly NodeObject[]>(value => Object.freeze([value]))
        ),
        pipe(
          literal(),
          transform<Literal, readonly Literal[]>(value => Object.freeze([value]))
        )
      ]),
      message
    ),
    freeze()
  );
}

export { nodeObject, type NodeObject };
