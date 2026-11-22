import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import * as NodeTest from 'node:test';
import { type BlankNodeIdentifier, type NodeReference } from '../../index.ts';
import createStoreAndController from '../createStoreAndController.ts';
import buildPermutatedFunction from '../buildPermutatedFunction.ts';

scenario(
  '"hasPart" is auto-fixed without conflict',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when.oneOf(
        buildPermutatedFunction(
          [
            ['a parent node with empty "hasPart" property', { hasPart: new Set<NodeReference>() }],
            ['a parent node with no "hasPart" property', undefined]
          ],
          (parameter, { controller }) => {
            // Parent is inserted in a separate transaction.
            controller.edit(transaction => {
              transaction.upsert('_:conversation', () => ({
                '@id': '_:conversation',
                '@type': new Set(['Conversation']),
                ...(parameter ? parameter : {})
              }));
            });

            // Parent is not touched in this transaction, it will be auto-fixed.
            controller.edit(transaction => {
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
            });
          }
        )
      )
      .then('the parent node should have `hasPart`', ({ store }) => {
        const parent = store.queryByIdentifier('_:conversation')!;

        expect(parent).toStrictEqual({
          '@id': '_:conversation',
          '@type': expect.any(Set),
          hasPart: expect.any(Set)
        });

        expect(Array.from(parent.hasPart!)).toStrictEqual([
          { '@id': '_:m-00001' satisfies BlankNodeIdentifier } satisfies NodeReference,
          { '@id': '_:m-00002' satisfies BlankNodeIdentifier } satisfies NodeReference
        ]);
      });
  },
  NodeTest
);
