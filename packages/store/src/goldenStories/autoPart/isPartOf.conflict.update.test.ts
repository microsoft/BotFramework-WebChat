import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import assert from 'node:assert';
import * as NodeTest from 'node:test';
import type { NodeReference } from '../../index.ts';
import buildPermutatedFunction from '../buildPermutatedFunction.ts';
import createStoreAndController from '../createStoreAndController.ts';

scenario(
  '"isPartOf" has conflicting auto-fix as the node is being updated',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when.oneOf(
        buildPermutatedFunction(
          [
            [
              'two children node with empty "isPartOf" property is updated before parent',
              [{ isPartOf: new Set<NodeReference>() }, true] as const
            ],
            ['two children node with no "isPartOf" property is updated before parent', [{}, true] as const],
            [
              'two children node with empty "isPartOf" property is updated after parent',
              [{ isPartOf: new Set<NodeReference>() }, false] as const
            ],
            ['two children node with no "isPartOf" property is updated after parent', [{}, false] as const]
          ],
          ([partialNode, updateFirst], { controller }) => {
            controller.edit(transaction => {
              transaction.upsert('_:m-00001', () => ({
                '@id': '_:m-00001',
                '@type': new Set(['Message'])
              }));

              transaction.upsert('_:m-00002', () => ({
                '@id': '_:m-00002',
                '@type': new Set(['Message'])
              }));
            });

            try {
              controller.edit(transaction => {
                const operations = [
                  () => {
                    // With empty/unset "isPartOf", it is conflicting with the change the parent proposed.
                    transaction.upsert('_:m-00001', node => ({ ...node!, ...partialNode, text: ['Hello, World!'] }));
                    transaction.upsert('_:m-00002', node => ({ ...node!, ...partialNode, text: ['Aloha!'] }));
                  },
                  () => {
                    transaction.upsert('_:conversation', () => ({
                      '@id': '_:conversation',
                      '@type': new Set(['Conversation']),
                      hasPart: new Set([{ '@id': '_:m-00001' }, { '@id': '_:m-00002' }])
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
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('message', expect.stringContaining('in the same transaction'));
      });
  },
  NodeTest
);
