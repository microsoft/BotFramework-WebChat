import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import { parse } from 'valibot';
import { nodeReferenceSchema, type ExactNodeReference, type NodeReference } from './NodeReference.ts';

function toExactNodeReference<T extends ExactNodeReference<T>>(value: T): NodeReference {
  return parse(nodeReferenceSchema, value);
}

function catchError(fn: () => void): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }

  return undefined;
}

scenario(
  'nodeReferenceSchema',
  bdd => {
    bdd
      .given('a node reference', () => ({ '@id': '_:m-1' }) as const)
      .when('parsed', value => toExactNodeReference(value))
      .then('should return the node reference', (value, nodeReference) => expect(nodeReference).toEqual(value))
      .and('should be assignable to NodeReference', (_, nodeReference) => {
        const reference: NodeReference = parse(nodeReferenceSchema, nodeReference);

        expect(reference).toEqual(nodeReference);
      });

    bdd
      .given(
        'a node reference with excess properties in a variable',
        () => ({ '@id': '_:m-1', name: 'Hello' }) as const
      )
      .when('parsed', value =>
        catchError(() =>
          // @ts-expect-error Excess properties are rejected by Exact, even the value is not an object literal.
          toExactNodeReference(value)
        )
      )
      .then('should throw at runtime', (_, error) => expect(error).toBeTruthy());
  },
  NodeTest
);
