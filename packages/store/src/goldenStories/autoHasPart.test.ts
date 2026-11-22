import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import * as NodeTest from 'node:test';
import { type BlankNodeIdentifier, type NodeReference } from '../index.ts';
import createStoreAndController from './createStoreAndController.ts';

scenario(
  'Child node is automatically referenced by parent node',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when.oneOf([
        [
          'a parent node with empty "hasPart" property, and a child node with parent is upserted',
          ({ controller }) => {
            controller.edit(transaction => {
              transaction.upsert('_:conversation', () => ({
                '@id': '_:conversation',
                '@type': new Set(['Conversation']),
                // Intentionally adding empty `hasPart`, but it should be auto-fixed later when the child is upserted.
                hasPart: new Set()
              }));

              transaction.upsert('_:m-00001', () => ({
                '@id': '_:m-00001',
                '@type': new Set(['Message']),
                // This `isPartOf` should auto-fix the parent node.
                isPartOf: new Set([{ '@id': '_:conversation' }])
              }));
            });
          }
        ],
        [
          'a parent node with no "hasPart" property, and a child node with parent is upserted',
          ({ controller }) => {
            controller.edit(transaction => {
              transaction.upsert('_:conversation', () => ({
                '@id': '_:conversation',
                '@type': new Set(['Conversation'])
                // Intentionally leaving `hasPart` not defined, but it should be auto-fixed later when the child is upserted.
              }));

              transaction.upsert('_:m-00001', () => ({
                '@id': '_:m-00001',
                '@type': new Set(['Message']),
                // This `isPartOf` should auto-fix the parent node.
                isPartOf: new Set([{ '@id': '_:conversation' }])
              }));
            });
          }
        ]
      ])
      .then('the parent node should have `hasPart`', ({ store }) => {
        const parent = store.queryByIdentifier('_:conversation')!;

        expect(parent).toStrictEqual({
          '@id': '_:conversation',
          '@type': expect.any(Set),
          hasPart: expect.any(Set)
        });

        expect(Array.from(parent.hasPart!)).toStrictEqual([
          { '@id': '_:m-00001' satisfies BlankNodeIdentifier } satisfies NodeReference
        ]);
      });
  },
  NodeTest
);
