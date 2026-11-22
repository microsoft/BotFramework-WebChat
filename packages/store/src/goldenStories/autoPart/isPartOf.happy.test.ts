import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import * as NodeTest from 'node:test';
import { type BlankNodeIdentifier, type NodeReference } from '../../index.ts';
import buildPermutatedFunction from '../buildPermutatedFunction.ts';
import createStoreAndController from '../createStoreAndController.ts';

scenario(
  '"isPartOf" is auto-fixed without conflict',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when.oneOf(
        buildPermutatedFunction(
          [
            ['two children node with empty "isPartOf" property', { isPartOf: new Set<NodeReference>() }],
            ['two children node with no "isPartOf" property', {}]
          ],
          (parameter, { controller }) => {
            // Two children is inserted in a separate transaction.
            controller.edit(transaction => {
              transaction.upsert('_:m-00001', () => ({
                '@id': '_:m-00001',
                '@type': new Set(['Message']),
                ...parameter
              }));

              transaction.upsert('_:m-00002', () => ({
                '@id': '_:m-00002',
                '@type': new Set(['Message']),
                ...parameter
              }));
            });

            // Children are not touched in this transaction, they will be auto-fixed.
            controller.edit(transaction => {
              transaction.upsert('_:conversation', () => ({
                '@id': '_:conversation',
                '@type': new Set(['Conversation']),
                hasPart: new Set([{ '@id': '_:m-00001' }, { '@id': '_:m-00002' }])
              }));
            });
          }
        )
      )
      .then('the first child node should have `isPartOf`', ({ store }) => {
        const firstChild = store.queryByIdentifier('_:m-00001')!;

        expect(firstChild).toStrictEqual({
          '@id': '_:m-00001',
          '@type': expect.any(Set),
          isPartOf: expect.any(Set)
        });

        expect(Array.from(firstChild.isPartOf!)).toStrictEqual([
          { '@id': '_:conversation' satisfies BlankNodeIdentifier } satisfies NodeReference
        ]);
      })
      .and('the second child node should have `isPartOf`', ({ store }) => {
        const secondChild = store.queryByIdentifier('_:m-00002')!;

        expect(secondChild).toStrictEqual({
          '@id': '_:m-00002',
          '@type': expect.any(Set),
          isPartOf: expect.any(Set)
        });

        expect(Array.from(secondChild.isPartOf!)).toStrictEqual([
          { '@id': '_:conversation' satisfies BlankNodeIdentifier } satisfies NodeReference
        ]);
      });
  },
  NodeTest
);
