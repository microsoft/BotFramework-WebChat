import { scenario } from '@testduet/given-when-then';
import assert from 'node:assert';
import * as NodeTest from 'node:test';
import createStoreAndController from '../createStoreAndController.ts';

scenario(
  'Inserted nodes are sorted by "dateCreated" property',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when('a node is inserted', precondition => {
        precondition.controller.edit(transaction => {
          transaction.upsert('_:m-00001', () => ({
            '@id': '_:m-00001',
            '@type': new Set(['Message']),
            identifier: new Set(['urn:com:example:message:1'])
          }));
        });

        return precondition;
      })
      .then('should be queryable by "identifier"', ({ store }) => {
        assert(store.queryByIdentifier('urn:com:example:message:1'));
      })
      .when('the node is deleted', ({ controller }) => {
        controller.edit(transaction => {
          transaction.delete('_:m-00001');
        });
      })
      .then('should not be queryable by "identifier"', ({ store }) => {
        assert(!store.queryByIdentifier('urn:com:example:message:1'));
      });
  },
  NodeTest
);
