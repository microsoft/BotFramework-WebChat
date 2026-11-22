import { scenario } from '@testduet/given-when-then';
import assert from 'node:assert';
import * as NodeTest from 'node:test';
import createStoreAndController from '../createStoreAndController.ts';

scenario(
  'Inserted nodes are sorted by "dateCreated" property',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .and('a node is inserted', precondition => {
        precondition.controller.edit(transaction => {
          transaction.upsert('_:m-00001', () => ({
            '@id': '_:m-00001',
            '@type': new Set(['Message']),
            identifier: new Set(['urn:com:example:message:1'])
          }));
        });

        return precondition;
      })
      .when('query the children nodes by both "@id" and "identifier"', ({ store }) => ({
        byAtId: store.queryByIdentifier('_:m-00001'),
        byIdentifier: store.queryByIdentifier('urn:com:example:message:1')
      }))
      .then('should query by "@id"', (_, outcome) => {
        assert(outcome.byAtId);
      })
      .and('should query by "identifier"', (_, outcome) => {
        assert(outcome.byIdentifier);
      })
      .and('should be same instance', (_, outcome) => {
        assert.equal(outcome.byAtId, outcome.byIdentifier);
      })
      .and('should notify listener with both ID', ({ onUpdate }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        assert.deepStrictEqual(Array.from(onUpdate.mock.calls[0]?.arguments[0]!), [
          '_:m-00001',
          'urn:com:example:message:1'
        ]);
      });
  },
  NodeTest
);
