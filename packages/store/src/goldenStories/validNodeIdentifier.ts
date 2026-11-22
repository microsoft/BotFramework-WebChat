import { scenario } from '@testduet/given-when-then';
import assert from 'node:assert';
import * as NodeTest from 'node:test';
import { type BlankNodeIdentifier, type NodeIdentifier } from '../index.ts';
import createStoreAndController from './createStoreAndController.ts';

scenario(
  'Child node is automatically referenced by parent node',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when('3 nodes with 3 different supported type of node identifier', ({ controller }) => {
        controller.edit(transaction => {
          transaction.upsert('_:node-identifier', () => ({
            '@id': '_:node-identifier' satisfies BlankNodeIdentifier,
            '@type': new Set(['Message'])
          }));

          transaction.upsert('urn:node-identifier', () => ({
            '@id': 'urn:node-identifier' satisfies NodeIdentifier,
            '@type': new Set(['Message'])
          }));

          transaction.upsert('https://node-identifier', () => ({
            '@id': 'https://node-identifier' satisfies NodeIdentifier,
            '@type': new Set(['Message'])
          }));
        });
      })
      .then('should query node with blank node identifier', ({ store }) => {
        assert(store.queryByIdentifier('_:node-identifier'));
      })
      .and('should query node with URN node identifier', ({ store }) => {
        assert(store.queryByIdentifier('urn:node-identifier'));
      })
      .and('should query node with https:// node identifier', ({ store }) => {
        assert(store.queryByIdentifier('https://node-identifier'));
      });
  },
  NodeTest
);
