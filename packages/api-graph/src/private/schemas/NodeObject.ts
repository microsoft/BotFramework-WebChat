import { array, lazy, objectWithRest, pipe, transform, union, type ErrorMessage, type GenericSchema } from 'valibot';

import identifier, { type Identifier } from './Identifier';
import { literal, type Literal } from './Literal';
import freeze from './private/freeze';

type Input = {
  '@id': Identifier;
} & {
  [key: string]: Literal | Input | (Literal | Input)[];
};

type NodeObject = {
  readonly '@id': Identifier;
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
      { '@id': identifier() },
      union([
        pipe(
          literal(),
          transform<Literal, readonly Literal[]>(value => Object.freeze([value]))
        ),
        pipe(array(literal()), freeze()),
        pipe(
          lazy(() => nodeObject()),
          transform<NodeObject, readonly NodeObject[]>(value => Object.freeze([value]))
        ),
        pipe(array(lazy(() => nodeObject())), freeze())
      ]),
      message
    ),
    freeze()
  );
}

export { nodeObject, type NodeObject };
