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
      .and('a parent node and a child node', precondition => {
        precondition.controller.edit(transaction => {
          transaction.upsert('_:conversation', () => ({
            '@id': '_:conversation',
            '@type': new Set(['Conversation']),
            hasPart: new Set([{ '@id': '_:m-00001' }])
          }));

          transaction.upsert('_:m-00001', () => ({
            '@id': '_:m-00001',
            '@type': new Set(['Message']),
            isPartOf: new Set([{ '@id': '_:conversation' }])
          }));
        });

        return precondition;
      })
      .when('the child node is deleted and re-added in the same transaction', ({ controller }) => {
        controller.edit(transaction => {
          transaction.delete('_:m-00001');

          // Re-add the node under the same transa({}) assert(!node);

          transaction.upsert('_:m-00001', () => ({
            '@id': '_:m-00001',
            '@type': new Set(['CreativeWork']),
            text: ['Hello, World!']
          }));
        });
      })
      .then('should have the new child node', ({ store }) => {
        const child = store.queryByIdentifier('_:m-00001');

        expect(child).toStrictEqual({
          '@id': '_:m-00001',
          '@type': expect.any(Set),
          text: ['Hello, World!']
        });

        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        assert.deepStrictEqual(Array.from(child?.['@type']!), ['CreativeWork']);
      })
      .and('should be disconnected from parent', ({ store }) => {
        // The newly added node does not have "isPartOf" property.
        const parent = store.queryByIdentifier('_:conversation');

        expect(parent).toStrictEqual({
          '@id': '_:conversation',
          '@type': expect.any(Set)
        });

        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        assert.deepStrictEqual(Array.from(parent?.['@type']!), ['Conversation']);
      });
  },
  NodeTest
);
