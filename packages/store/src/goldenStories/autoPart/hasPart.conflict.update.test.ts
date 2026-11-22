import { scenario } from '@testduet/given-when-then';
import assert from 'node:assert';
import * as NodeTest from 'node:test';
import type { NodeReference } from '../../index.ts';
import buildPermutatedFunction from '../buildPermutatedFunction.ts';
import createStoreAndController from '../createStoreAndController.ts';

scenario(
  '"hasPart" has conflicting auto-fix as the node is being updated',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when.oneOf(
        buildPermutatedFunction(
          [
            [
              'a parent node with empty "hasPart" property is updated before two children',
              [{ hasPart: new Set<NodeReference>() }, true] as const
            ],
            ['a parent node with no "hasPart" property is updated before two children', [{}, true] as const],
            [
              'a parent node with empty "hasPart" property is updated after two children',
              [{ hasPart: new Set<NodeReference>() }, false] as const
            ],
            ['a parent node with no "hasPart" property is updated after two children', [{}, false] as const]
          ],
          ([partialNode, updateFirst], { controller }) => {
            controller.edit(transaction => {
              transaction.upsert('_:conversation', () => ({
                '@id': '_:conversation',
                '@type': new Set(['Conversation'])
              }));
            });

            try {
              controller.edit(transaction => {
                const operations = [
                  () => {
                    // With empty/unset "hasPart", it is conflicting with the change the parent proposed.
                    transaction.upsert('_:conversation', node => ({
                      ...node!,
                      ...partialNode,
                      text: ['Hello, World!']
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

                updateFirst || operations.reverse();

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
        assert(error instanceof Error);
        assert((error['message'] as string).includes('in the same transaction'));
      });
  },
  NodeTest
);
