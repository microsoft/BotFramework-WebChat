import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import assert from 'node:assert';
import * as NodeTest from 'node:test';
import createStoreAndController from '../createStoreAndController.ts';

scenario(
  'Inserted nodes are sorted by "dateCreated" property',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .and('two nodes are inserted', precondition => {
        precondition.controller.edit(transaction => {
          transaction.upsert('_:m-00001', () => ({
            '@id': '_:m-00001',
            '@type': new Set(['Message']),
            identifier: new Set(['urn:com:example:message:1'])
          }));

          transaction.upsert('_:m-00002', () => ({
            '@id': '_:m-00002',
            '@type': new Set(['Message']),
            identifier: new Set(['urn:com:example:message:2'])
          }));
        });

        return precondition;
      })
      .when('alternate identifier are switched between both nodes', ({ controller }) => {
        controller.edit(transaction => {
          transaction.upsert('_:m-00001', node => ({ ...node!, identifier: new Set(['urn:com:example:message:2']) }));
          transaction.upsert('_:m-00002', node => ({ ...node!, identifier: new Set(['urn:com:example:message:1']) }));
        });
      })
      .then('first node should have correct "identifier" value', ({ store }) => {
        const firstNode = store.queryByIdentifier('_:m-00001')!;

        assert(firstNode);
        expect(firstNode).toStrictEqual({
          '@id': '_:m-00001',
          '@type': expect.any(Set),
          identifier: expect.any(Set)
        });
        assert.deepStrictEqual(Array.from(firstNode['@type']), ['Message']);
        assert.deepStrictEqual(Array.from(firstNode.identifier!), ['urn:com:example:message:2']);
      })
      .and('second node should have correct "identifier" value', ({ store }) => {
        const secondNode = store.queryByIdentifier('_:m-00002')!;

        assert(secondNode);
        expect(secondNode).toStrictEqual({
          '@id': '_:m-00002',
          '@type': expect.any(Set),
          identifier: expect.any(Set)
        });
        assert.deepStrictEqual(Array.from(secondNode['@type']), ['Message']);
        assert.deepStrictEqual(Array.from(secondNode.identifier!), ['urn:com:example:message:1']);
      });
  },
  NodeTest
);
