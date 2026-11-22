import { scenario } from '@testduet/given-when-then';
import assert from 'node:assert';
import * as NodeTest from 'node:test';
import createStoreAndController from '../createStoreAndController.ts';

scenario(
  '"identifier" value should be unique across nodes',
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
      .when('another node of same alternate identifier is inserted', ({ controller }) => {
        try {
          controller.edit(transaction => {
            transaction.upsert('_:m-00002', () => ({
              '@id': '_:m-00002',
              '@type': new Set(['Message']),
              identifier: new Set(['urn:com:example:message:1'])
            }));
          });
        } catch (error) {
          return error;
        }

        return undefined;
      })
      .then('should throw', (_, error) => {
        assert(error);
        assert(error instanceof Error);
        assert((error['message'] as string).includes('is already used by node'));
      });
  },
  NodeTest
);
