import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import assert from 'node:assert';
import * as NodeTest from 'node:test';
import createStoreAndController from './createStoreAndController.ts';

scenario(
  'Update a node will replace its content',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when('a node is inserted', ({ controller }) => {
        controller.edit(transaction => {
          transaction.upsert('_:m-00001', () => ({
            '@id': '_:m-00001',
            '@type': new Set(['Message']),
            text: ['Hello, World!']
          }));
        });
      })
      .then('should be able to query the inserted node', ({ store }) => {
        const node = store.queryByIdentifier('_:m-00001');

        expect(node).toStrictEqual({
          '@id': '_:m-00001',
          '@type': expect.any(Set),
          text: ['Hello, World!']
        });

        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        expect(Array.from(node?.['@type']!)).toStrictEqual(['Message']);
      })
      .and('should have called the listener', ({ onUpdate }) => {
        assert.equal(onUpdate.mock.callCount(), 1);
      })
      .when('the node is updated', ({ controller, onUpdate }) => {
        onUpdate.mock.resetCalls();

        controller.edit(transaction => {
          transaction.upsert('_:m-00001', node => {
            expect(node).toStrictEqual({
              '@id': '_:m-00001',
              '@type': expect.any(Set),
              text: ['Hello, World!']
            });

            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
            expect(Array.from(node?.['@type']!)).toStrictEqual(['Message']);

            return {
              '@id': '_:m-00001',
              '@type': new Set(['CreativeWork'])
            };
          });
        });
      })
      .then('should have replaced the node', ({ store }) => {
        const node = store.queryByIdentifier('_:m-00001');

        expect(node).toStrictEqual({
          '@id': '_:m-00001',
          '@type': expect.any(Set)
        });

        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        expect(Array.from(node?.['@type']!)).toStrictEqual(['CreativeWork']);
      })
      .and('should have called the listener', ({ onUpdate }) => {
        assert.equal(onUpdate.mock.callCount(), 1);

        // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
        const updatedNodeIds = onUpdate.mock.calls[0]?.arguments[0]!;

        expect(updatedNodeIds).toBeInstanceOf(Set);
        expect(Array.from(updatedNodeIds)).toStrictEqual(['_:m-00001']);
      });
  },
  NodeTest
);
