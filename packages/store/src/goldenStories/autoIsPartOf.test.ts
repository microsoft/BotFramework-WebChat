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
      .when('a parent node with a children, and a child node with no parent is upserted', ({ controller }) => {
        controller.edit(transaction => {
          // Intentionally adding a parent node without child node exist.
          transaction.upsert('_:conversation', () => ({
            '@id': '_:conversation',
            '@type': new Set(['Conversation']),
            hasPart: new Set([{ '@id': '_:m-00001' }])
          }));

          transaction.upsert('_:m-00001', () => ({
            '@id': '_:m-00001',
            '@type': new Set(['Message'])
          }));
        });
      })
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
