import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import * as NodeTest from 'node:test';
import createStoreAndController from './createStoreAndController.ts';
import assert from 'node:assert';

scenario(
  '"@id" must not change',
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
            isPartOf: new Set([{ '@id': '_:conversation' }]),
            text: ['Hello, World!']
          }));
        });

        return precondition;
      })
      .when('the child node is updated with a new @id', ({ controller }) => {
        try {
          controller.edit(transaction => {
            transaction.upsert('_:m-00001', node => ({
              ...node!,
              '@id': '_:m-00002',
              text: ['Aloha!']
            }));
          });
        } catch (error) {
          return error;
        }

        return undefined;
      })
      .then('should throw', (_, error) => {
        assert(error);
        expect(error).toBeInstanceOf(Error);
        expect(error).toHaveProperty('message', expect.stringContaining('must have @id of'));
      });
  },
  NodeTest
);
