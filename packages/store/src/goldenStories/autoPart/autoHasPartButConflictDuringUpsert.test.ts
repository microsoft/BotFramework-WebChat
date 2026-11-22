import { scenario } from '@testduet/given-when-then';
import assert from 'assert';
import { expect } from 'expect';
import * as NodeTest from 'node:test';
import createStoreAndController from '../createStoreAndController.ts';

scenario(
  'Child node is referencing a parent node but parent node is deleting it in same transaction',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when('a parent node with no children, and a child node with parent is upserted', ({ controller }) => {
        controller.edit(transaction => {
          transaction.upsert('_:conversation', () => ({
            '@id': '_:conversation',
            '@type': new Set(['Conversation'])
          }));
        });

        try {
          controller.edit(transaction => {
            transaction.upsert('_:m-00001', () => ({
              '@id': '_:m-00001',
              '@type': new Set(['Message']),
              isPartOf: new Set([{ '@id': '_:conversation' }])
            }));

            // Intentionally editing the parent node without adding "hasPart", meaning it is deleting the relationship.
            transaction.upsert('_:conversation', node => ({ ...node!, text: ['Hello, World!'] }));
          });
        } catch (error) {
          return error;
        }

        return undefined;
      })
      .then('should throw', (_, error) => {
        assert(error);
        expect(error).toHaveProperty('message', expect.stringContaining('in the same transaction'));
      });
  },
  NodeTest
);
