import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import assert from 'node:assert';
import * as NodeTest from 'node:test';
import createStoreAndController from './createStoreAndController.ts';

scenario(
  'Deleting a node',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .and('a node', precondition => {
        precondition.controller.edit(transaction => {
          transaction.upsert('_:m-00001', () => ({
            '@id': '_:m-00001',
            '@type': new Set(['Message'])
          }));
        });

        return precondition;
      })
      .when('the node is deleted', ({ controller }) => {
        controller.edit(transaction => {
          transaction.delete('_:m-00001');
        });
      })
      .then('should have no nodes', ({ store }) => {
        expect(Array.from(store.getSnapshot())).toHaveLength(0);
      })
      .when('the node is deleted again', ({ controller }) => {
        try {
          controller.edit(transaction => {
            transaction.delete('_:m-00001');
          });
        } catch (error) {
          return error;
        }

        return undefined;
      })
      .then('should not throw', (_, error) => {
        assert(!error);
      });
  },
  NodeTest
);
