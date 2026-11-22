import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import assert from 'node:assert';
import * as NodeTest from 'node:test';
import { type NodeReference } from '../../index.ts';
import buildWhenPermutationWithParameters from '../buildWhenPermutationWithParameters.ts';
import createStoreAndController from '../createStoreAndController.ts';

scenario(
  '"isPartOf" has conflicting auto-fix as the node is being inserted',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when.oneOf(
        buildWhenPermutationWithParameters<
          [{ isPartOf: Set<NodeReference> } | { isPartOf?: never }, boolean],
          ReturnType<typeof createStoreAndController>,
          void
        >(
          [
            [
              'two children node with empty "isPartOf" property is inserted before parent',
              [{ isPartOf: new Set() }, true]
            ],
            ['two children node with no "isPartOf" property is inserted before parent', [{}, true]],
            [
              'two children node with empty "isPartOf" property is inserted after parent',
              [{ isPartOf: new Set() }, false]
            ],
            ['two children node with no "isPartOf" property is inserted after parent', [{}, false]]
          ],
          ([partialNode, insertFirst], { controller }) => {
            try {
              controller.edit(transaction => {
                const operations = [
                  () => {
                    // With empty/unset "isPartOf", it is conflicting with the change the parent proposed.
                    transaction.upsert('_:m-00001', () => ({
                      '@id': '_:m-00001',
                      '@type': new Set(['Message']),
                      ...partialNode
                    }));

                    transaction.upsert('_:m-00002', () => ({
                      '@id': '_:m-00002',
                      '@type': new Set(['Message']),
                      ...partialNode
                    }));
                  },
                  () => {
                    transaction.upsert('_:conversation', () => ({
                      '@id': '_:conversation',
                      '@type': new Set(['Conversation']),
                      hasPart: new Set([{ '@id': '_:m-00001' }, { '@id': '_:m-00002' }])
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
