import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import createTestStore from './testHelpers/createTestStore.ts';

scenario(
  'Store transaction reads',
  bdd => {
    bdd
      .given('a store', () => createTestStore())
      .when('a node is upserted and read back in the same transaction, and a missing node is read', ({ edit }) => {
        const reads: unknown[] = [];

        edit(transaction => {
          reads.push(transaction.getNode('_:a-00001'));

          transaction.upsertNode({ '@id': '_:a-00001', '@type': new Set(['Message']), text: ['Hello, World!'] });

          reads.push(transaction.getNode('_:a-00001'));
        });

        return reads;
      })
      .then('should not find the node before it is upserted', (_, [before]) => expect(before).toBeUndefined())
      .and('should find the node after it is upserted', (_, [, after]) =>
        expect(after).toEqual({ '@id': '_:a-00001', '@type': new Set(['Message']), text: ['Hello, World!'] })
      )
      .and('should have the node in the snapshot', ({ store }) =>
        expect(store.getSnapshot().has('_:a-00001')).toBe(true)
      );
  },
  NodeTest
);
