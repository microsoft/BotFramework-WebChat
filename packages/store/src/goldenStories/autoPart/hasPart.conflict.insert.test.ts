import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import assert from 'node:assert';
import * as NodeTest from 'node:test';
import { type NodeReference } from '../../index.ts';
import buildWhenPermutationWithParameters from '../buildWhenPermutationWithParameters.ts';
import createStoreAndController from '../createStoreAndController.ts';

scenario(
  '"hasPart" has conflicting auto-fix as the node is being inserted',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when.oneOf(
        buildWhenPermutationWithParameters<
          [{ hasPart: Set<NodeReference> } | { hasPart?: never }, boolean],
          ReturnType<typeof createStoreAndController>,
          void
        >(
          [
            [
              'a parent node with empty "hasPart" property is inserted before two children',
              [{ hasPart: new Set() }, true]
            ],
            ['a parent node with no "hasPart" property is inserted before two children', [{}, true]],
            [
              'a parent node with empty "hasPart" property is inserted after two children',
              [{ hasPart: new Set() }, false]
            ],
            ['a parent node with no "hasPart" property is inserted after two children', [{}, false]]
          ],
          ([partialNode, insertFirst], { controller }) => {
            try {
              controller.edit(transaction => {
                const operations = [
                  () => {
                    // With empty/unset "hasPart", it is conflicting with the change the children proposed.
                    transaction.upsert('_:conversation', () => ({
                      '@id': '_:conversation',
                      '@type': new Set(['Conversation']),
                      ...partialNode
                    }));
                  },
                  () => {
                    transaction.upsert('_:m-00001', () => ({
                      '@id': '_:m-00001',
                      '@type': new Set(['Message']),
                      isPartOf: new Set([{ '@id': '_:conversation' }])
                    }));

                    transaction.upsert('_:m-00002', () => ({
                      '@id': '_:m-00002',
                      '@type': new Set(['Message']),
                      isPartOf: new Set([{ '@id': '_:conversation' }])
                    }));
                  }
                ];

                insertFirst || operations.reverse();

                for (const fn of operations) {
                  fn();
                }
              });
            } catch (error) {
              return error;
            }

            return undefined;
          }
        )
      )
      .then('should throw', (_, error) => {
        assert(error);
        expect(error).toHaveProperty('message', expect.stringContaining('in the same transaction'));
      });
  },
  NodeTest
);
