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
      .when('a parent node with no children, and a child node with parent is upserted', ({ controller }) => {
        controller.edit(transaction => {
          // Intentionally adding a child node without parent node exist.
          transaction.upsert('_:m-00001', () => ({
            '@id': '_:m-00001',
            '@type': new Set(['Message']),
            isPartOf: new Set([{ '@id': '_:conversation' }])
          }));

          transaction.upsert('_:conversation', () => ({
            '@id': '_:conversation',
            '@type': new Set(['Conversation'])
          }));
        });
      })
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
