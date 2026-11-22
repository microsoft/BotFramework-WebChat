import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import * as NodeTest from 'node:test';
import { type BlankNodeIdentifier, type NodeReference } from '../index.ts';
import createStoreAndController from './createStoreAndController.ts';

scenario(
  'Parent node is automatically referenced by child node',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when.oneOf([
        [
          'a parent node with a children, and a child node with empty "isPartOf" property',
          ({ controller }) => {
            controller.edit(transaction => {
              transaction.upsert('_:m-00001', () => ({
                '@id': '_:m-00001',
                '@type': new Set(['Message']),
                // Intentionally adding empty `isPartOf`, but it should be auto-fixed later when the parent is upserted.
                isPartOf: new Set()
              }));

              transaction.upsert('_:conversation', () => ({
                '@id': '_:conversation',
                '@type': new Set(['Conversation']),
                // This `hasPart` should auto-fix the child node.
                hasPart: new Set([{ '@id': '_:m-00001' }])
              }));
            });
          }
        ],
        [
          'a parent node with a children, and a child node with no "isPartOf" property',
          ({ controller }) => {
            controller.edit(transaction => {
              transaction.upsert('_:m-00001', () => ({
                '@id': '_:m-00001',
                '@type': new Set(['Message'])
                // Intentionally leaving `isPartOf` not defined, but it should be auto-fixed later when the parent is upserted.
              }));

              transaction.upsert('_:conversation', () => ({
                '@id': '_:conversation',
                '@type': new Set(['Conversation']),
                // This `hasPart` should auto-fix the child node.
                hasPart: new Set([{ '@id': '_:m-00001' }])
              }));
            });
          }
        ]
      ])
      .then('the child node should have `isPartOf`', ({ store }) => {
        const child = store.queryByIdentifier('_:m-00001')!;

        expect(child).toStrictEqual({
          '@id': '_:m-00001',
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
