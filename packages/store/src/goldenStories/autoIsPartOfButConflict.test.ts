import { scenario } from '@testduet/given-when-then';
import assert from 'assert';
import * as NodeTest from 'node:test';
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

          // Intentionally omitting "isPartOf" so the child is explicitly deleting the relationship.
          transaction.upsert('_:m-00001', () => ({
            '@id': '_:m-00001',
            '@type': new Set(['Message'])
          }));
        });
      })
      .then('should throw', (_, error) => {
        assert(error);
      });
  },
  NodeTest
);
