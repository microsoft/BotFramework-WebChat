import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import assert from 'node:assert';
import * as NodeTest from 'node:test';
import createStoreAndController from './createStoreAndController.ts';

scenario(
  'All custom properties must be array',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when('a node with property value of non-array is upserted', ({ controller }) => {
        try {
          controller.edit(transaction => {
            transaction.upsert('_:n-00001', () => ({
              '@id': '_:n-00001',
              '@type': new Set(['Message']),
              text: 'Hello, World!' as any
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
      });
  },
  NodeTest
);
