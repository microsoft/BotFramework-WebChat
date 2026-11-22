import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import assert from 'node:assert';
import * as NodeTest from 'node:test';
import type { UpsertNode } from '../index.ts';
import type { NodeIdentifier } from '../node/NodeIdentifier.ts';
import createStoreAndController from './createStoreAndController.ts';

scenario(
  'Upserted node is different and frozen',
  bdd => {
    bdd
      .given('a store and a controller', () => createStoreAndController())
      .when('a node is upserted', ({ controller }) => {
        const upserted: UpsertNode<{ text: string[] }> = {
          '@id': '_:n-1' satisfies NodeIdentifier,
          '@type': new Set(['Message']),
          text: ['Hello, World!']
        };

        controller.edit(transaction => {
          transaction.upsert(upserted['@id'], () => upserted);
        });

        return { upserted };
      })
      .then('should able to query the upserted node', ({ store }) => {
        assert(store.queryByIdentifier('_:n-1'));
      })
      .and('should have called the listener', ({ onUpdate }) => {
        assert.equal(onUpdate.mock.callCount(), 1);
      })
      .when('the node is queried', ({ store }, outcome) => ({
        ...outcome,
        queried: store.queryByIdentifier('_:n-1')!
      }))
      .then('should have all properties', (_, { queried }) => {
        expect(queried).toStrictEqual({
          '@id': '_:n-1',
          '@type': expect.any(Set),
          text: ['Hello, World!']
        });

        assert.deepStrictEqual(Array.from(queried?.['@type']), ['Message']);
      })
      .and('should not be reference equal to the upserted node', (_, { queried, upserted }) => {
        assert.notEqual(queried, upserted);
      })
      .and('the queried node should be frozen', (_, { queried }) => {
        assert(Object.isFrozen(queried));
      })
      .when('the upserted node is modified accidentally', ({ onUpdate }, outcome) => {
        onUpdate.mock.resetCalls();

        outcome.upserted.text.push('Aloha!');

        return outcome;
      })
      .then('the upserted node should have the change', (_, { upserted }) => {
        assert.deepStrictEqual(upserted.text, ['Hello, World!', 'Aloha!']);
      })
      .and('the queried node should not be changed', (_, { queried }) => {
        assert.deepStrictEqual(queried['text'], ['Hello, World!']);
      })
      .and('should not have called the listener', ({ onUpdate }) => {
        assert.equal(onUpdate.mock.callCount(), 0);
      });
  },
  NodeTest
);
