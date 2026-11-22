import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import assert from 'node:assert';
import * as NodeTest from 'node:test';
import createStoreAndController from './createStoreAndController.ts';

scenario(
  'Failing upsert should not be committed',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when('a node is upserted properly in a single transaction', ({ controller }) => {
        controller.edit(transaction => {
          transaction.upsert('_:n-00001', () => ({
            '@id': '_:n-00001',
            '@type': new Set(['Message']),
            text: ['Hello, World!']
          }));
        });
      })
      .then('should be in the system', ({ store }) => {
        assert(store.queryByIdentifier('_:n-00001'));
      })
      .when('the node is upserted with invalid content', ({ controller }) => {
        try {
          controller.edit(transaction => {
            try {
              transaction.upsert('_:n-00002', () => ({
                '@id': '_:n-00002',
                '@type': new Set(['Message'])
              }));
            } catch (error) {
              // Inserting another node must not fail.
              assert(!error);
            }

            transaction.upsert('_:n-00001', node => ({
              ...node!,
              alternativeText: 'Aloha!' as any
            }));
          });
        } catch (error) {
          return error;
        }

        return undefined;
      })
      .then('should throw', (_, error) => {
        assert(error);
        expect(error).toHaveProperty('message', expect.stringContaining('must be array of'));
      })
      .and('should keep the original node', ({ store }) => {
        const node = store.queryByIdentifier('_:n-00001')!;

        expect(node).toStrictEqual({
          '@id': '_:n-00001',
          '@type': expect.any(Set),
          text: ['Hello, World!']
        });

        expect(Array.from(node['@type'])).toStrictEqual(['Message']);
      })
      .and('should not keep other node in the same transaction', ({ store }) => {
        assert(!store.queryByIdentifier('_:n-00002'));
      });
  },
  NodeTest
);
