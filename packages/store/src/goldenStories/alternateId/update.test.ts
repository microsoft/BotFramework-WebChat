import { scenario } from '@testduet/given-when-then';
import assert from 'node:assert';
import * as NodeTest from 'node:test';
import createStoreAndController from '../createStoreAndController.ts';

scenario(
  'Inserted nodes are sorted by "dateCreated" property',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .and('a node is inserted and updated with new "identifier"', precondition => {
        precondition.controller.edit(transaction => {
          transaction.upsert('_:m-00001', () => ({
            '@id': '_:m-00001',
            '@type': new Set(['Message']),
            identifier: new Set(['urn:com:example:message:1'])
          }));
        });

        precondition.controller.edit(transaction => {
          transaction.upsert('_:m-00001', () => ({
            '@id': '_:m-00001',
            '@type': new Set(['Message']),
            identifier: new Set(['urn:com:example:message:2'])
          }));
        });

        return precondition;
      })
      .when('query the children nodes by both "@id" and "identifier"', ({ store }) => ({
        byAtId: store.queryByIdentifier('_:m-00001'),
        byIdentifier: store.queryByIdentifier('urn:com:example:message:2')
      }))
      .then('should query by "@id"', (_, outcome) => {
        assert(outcome.byAtId);
      })
      .and('should query by new "identifier"', (_, outcome) => {
        assert(outcome.byIdentifier);
      })
      .and('should not queryable by old "identifier"', ({ store }) => {
        assert(!store.queryByIdentifier('urn:com:example:message:1'));
      })
      .and('should be same instance', (_, outcome) => {
        assert.equal(outcome.byAtId, outcome.byIdentifier);
      })
      .and('should notify listener twice', ({ onUpdate }) => {
        assert.equal(onUpdate.mock.callCount(), 2);
      })
      .and('should notify listener with both ID', ({ onUpdate }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        assert.deepStrictEqual(Array.from(onUpdate.mock.calls[0]?.arguments[0]!), [
          '_:m-00001',
          'urn:com:example:message:1'
        ]);

        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        assert.deepStrictEqual(Array.from(onUpdate.mock.calls[1]?.arguments[0]!), [
          '_:m-00001',
          'urn:com:example:message:1', // This identifier is being deleted/replaced, need to notify.
          'urn:com:example:message:2'
        ]);
      })
      .when('the node "identifier" property is updated again', ({ controller, onUpdate }) => {
        onUpdate.mock.resetCalls();

        controller.edit(transaction => {
          transaction.upsert('_:m-00001', node => ({ ...node!, identifier: new Set(['urn:com:example:message:3']) }));
        });
      })
      .then('should be queryable by latest "identifier" value', ({ store }) => {
        assert(store.queryByIdentifier('urn:com:example:message:3'));
      })
      .and('should notify listener with both ID', ({ onUpdate }) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        assert.deepStrictEqual(Array.from(onUpdate.mock.calls[0]?.arguments[0]!), [
          '_:m-00001',
          'urn:com:example:message:2', // This identifier is being deleted/replaced, need to notify.
          'urn:com:example:message:3'
        ]);
      });
  },
  NodeTest
);
