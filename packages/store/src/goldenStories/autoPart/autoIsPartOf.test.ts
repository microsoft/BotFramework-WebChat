import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import * as NodeTest from 'node:test';
import { type BlankNodeIdentifier, type NodeReference } from '../../index.ts';
import buildWhenPermutationWithParameters from '../buildWhenPermutationWithParameters.ts';
import createStoreAndController from '../createStoreAndController.ts';

scenario(
  'Parent node is automatically referenced by child node',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when.oneOf(
        buildWhenPermutationWithParameters<
          { isPartOf: Set<NodeReference> } | { isPartOf?: never },
          ReturnType<typeof createStoreAndController>,
          void
        >(
          [
            [
              'a parent node with two children, and both children with empty "isPartOf" property',
              // Intentionally adding empty `isPartOf`, but it should be auto-fixed later when the parent is upserted.
              { isPartOf: new Set() }
            ],
            [
              'a parent node with two children, and both children with no "isPartOf" property defined',
              // Intentionally adding empty `isPartOf`, but it should be auto-fixed later when the parent is upserted.
              {}
            ]
          ],
          (parameter, { controller }) => {
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

              transaction.upsert('_:conversation', () => ({
                '@id': '_:conversation',
                '@type': new Set(['Conversation']),
                // This `hasPart` should auto-fix the child node.
                hasPart: new Set([{ '@id': '_:m-00001' }, { '@id': '_:m-00002' }])
              }));
            });
          }
        )
      )
      .then('the first child node should have `isPartOf`', ({ store }) => {
        const child = store.queryByIdentifier('_:m-00001')!;

        expect(child).toStrictEqual({
          '@id': '_:m-00001',
          '@type': expect.any(Set),
          isPartOf: expect.any(Set)
        });

        expect(Array.from(child.isPartOf!)).toStrictEqual([
          { '@id': '_:conversation' satisfies BlankNodeIdentifier } satisfies NodeReference
        ]);
      })
      .and('the second child node should have `isPartOf`', ({ store }) => {
        const child = store.queryByIdentifier('_:m-00002')!;

        expect(child).toStrictEqual({
          '@id': '_:m-00002',
          '@type': expect.any(Set),
          isPartOf: expect.any(Set)
        });

        expect(Array.from(child.isPartOf!)).toStrictEqual([
          { '@id': '_:conversation' satisfies BlankNodeIdentifier } satisfies NodeReference
        ]);
      });
  },
  NodeTest
);
