import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import Store, { type StoreTransactor } from './Store.ts';

function createStore() {
  let controller: StoreTransactor | undefined;

  const store = new Store({
    start(nextController) {
      controller = nextController;
    }
  });

  if (!controller) {
    throw new Error('Controller should be set after start');
  }

  return { controller, store };
}

function createStoreWithNodes() {
  const { controller, store } = createStore();

  controller.edit(transaction => {
    transaction.upsert('_:conversation', () => ({
      '@id': '_:conversation',
      '@type': new Set(['Conversation']),
      hasPart: new Set([{ '@id': '_:m-1' }, { '@id': '_:m-2' }])
    }));

    transaction.upsert('_:m-1', () => ({
      '@id': '_:m-1',
      '@type': new Set(['Message']),
      isPartOf: new Set([{ '@id': '_:conversation' }]),
      text: ['Hello']
    }));

    transaction.upsert('_:m-2', () => ({
      '@id': '_:m-2',
      '@type': new Set(['Message']),
      citation: [{ '@id': '_:m-1' }, 'https://example.com/'],
      isPartOf: new Set([{ '@id': '_:conversation' }]),
      mentions: [{ '@id': '_:m-1' }],
      text: ['World']
    }));
  });

  return { controller, store };
}

scenario(
  'upsert',
  bdd => {
    bdd
      .given('an empty store', () => createStore())
      .when('a node is upserted', ({ controller }) => {
        const nodesPassedToUpdater: unknown[] = [];

        controller.edit(transaction =>
          transaction.upsert('_:m-1', node => {
            nodesPassedToUpdater.push(node);

            return { '@id': '_:m-1', '@type': new Set(['Message']), text: ['Hello'] };
          })
        );

        return nodesPassedToUpdater;
      })
      .then('updater should receive undefined', (_, nodesPassedToUpdater) =>
        expect(nodesPassedToUpdater).toEqual([undefined])
      )
      .and('should add the node', ({ store }) =>
        expect(store.getSnapshot().get('_:m-1')).toEqual({
          '@id': '_:m-1',
          '@type': new Set(['Message']),
          text: ['Hello']
        })
      );

    bdd
      .given('a store with a node', () => createStoreWithNodes())
      .when('the node is updated', ({ controller }) => {
        const nodesPassedToUpdater: unknown[] = [];

        controller.edit(transaction =>
          transaction.upsert('_:m-1', node => {
            nodesPassedToUpdater.push(node);

            return { ...node!, text: ['Aloha'] };
          })
        );

        return nodesPassedToUpdater;
      })
      .then('updater should receive the existing node', (_, nodesPassedToUpdater) =>
        expect(nodesPassedToUpdater).toEqual([expect.objectContaining({ '@id': '_:m-1', text: ['Hello'] })])
      )
      .and('should update the node', ({ store }) =>
        expect(store.getSnapshot().get('_:m-1')).toHaveProperty('text', ['Aloha'])
      );

    bdd
      .given('a store with a node', () => createStoreWithNodes())
      .when('the updater changes the @id', ({ controller }) => {
        try {
          controller.edit(transaction => transaction.upsert('_:m-1', node => ({ ...node!, '@id': '_:m-999' })));
        } catch (error) {
          return error;
        }

        return undefined;
      })
      .then('should throw', (_, error) => expect(error).toEqual(expect.any(Error)))
      .and('should not add the node with new @id', ({ store }) =>
        expect(store.getSnapshot().has('_:m-999')).toBe(false)
      )
      .and('should keep the original node', ({ store }) =>
        expect(store.getSnapshot().get('_:m-1')).toHaveProperty('text', ['Hello'])
      );
  },
  NodeTest
);

scenario(
  'delete',
  bdd => {
    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a node is deleted', ({ controller }) => {
        let affectedNodeIds: readonly string[] = [];

        controller.edit(transaction => {
          affectedNodeIds = transaction.delete('_:m-1');
        });

        return affectedNodeIds;
      })
      .then('should return IDs of nodes which referenced the deleted node', (_, affectedNodeIds) =>
        expect([...affectedNodeIds].sort()).toEqual(['_:conversation', '_:m-2'])
      )
      .and('should remove the node', ({ store }) => expect(store.getSnapshot().has('_:m-1')).toBe(false))
      .and('should remove the reference from hasPart', ({ store }) =>
        expect(store.getSnapshot().get('_:conversation')).toHaveProperty('hasPart', new Set([{ '@id': '_:m-2' }]))
      )
      .and('should remove the reference from other property but keep other values', ({ store }) =>
        expect(store.getSnapshot().get('_:m-2')).toHaveProperty('citation', ['https://example.com/'])
      )
      .and('should remove the property if it become empty', ({ store }) =>
        expect(store.getSnapshot().get('_:m-2')).not.toHaveProperty('mentions')
      )
      .and('should keep unrelated properties', ({ store }) =>
        expect(store.getSnapshot().get('_:m-2')).toHaveProperty('text', ['World'])
      );

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a node without any referencing nodes is deleted', ({ controller }) => {
        let affectedNodeIds: readonly string[] = [];

        controller.edit(transaction => {
          affectedNodeIds = transaction.delete('_:conversation');
        });

        return affectedNodeIds;
      })
      .then('should return IDs of nodes which referenced the deleted node', (_, affectedNodeIds) =>
        expect([...affectedNodeIds].sort()).toEqual(['_:m-1', '_:m-2'])
      )
      .and('should remove isPartOf property', ({ store }) => {
        expect(store.getSnapshot().get('_:m-1')).not.toHaveProperty('isPartOf');
        expect(store.getSnapshot().get('_:m-2')).not.toHaveProperty('isPartOf');
      });

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a node is deleted and upserted in the same transaction', ({ controller }) => {
        const nodesPassedToUpdater: unknown[] = [];

        controller.edit(transaction => {
          transaction.delete('_:m-1');
          transaction.upsert('_:m-1', node => {
            nodesPassedToUpdater.push(node);

            return { '@id': '_:m-1', '@type': new Set(['Message']), text: ['Again'] };
          });
        });

        return nodesPassedToUpdater;
      })
      .then('updater should receive undefined', (_, nodesPassedToUpdater) =>
        expect(nodesPassedToUpdater).toEqual([undefined])
      )
      .and('should have the new node', ({ store }) =>
        expect(store.getSnapshot().get('_:m-1')).toHaveProperty('text', ['Again'])
      );
  },
  NodeTest
);

scenario(
  'transaction',
  bdd => {
    bdd
      .given('a store with cross-referencing nodes and a listener', () => {
        const { controller, store } = createStoreWithNodes();
        const numCalls = { value: 0 };

        store.subscribe(() => numCalls.value++);

        return { controller, numCalls, store, snapshot: store.getSnapshot() };
      })
      .when('the transactor throws after edits', ({ controller }) => {
        try {
          controller.edit(transaction => {
            transaction.upsert('_:m-1', node => ({ ...node!, text: ['Aloha'] }));
            transaction.upsert('_:m-3', () => ({ '@id': '_:m-3', '@type': new Set(['Message']) }));
            transaction.delete('_:m-2');

            throw new Error('Artificial');
          });
        } catch (error) {
          return error;
        }

        return undefined;
      })
      .then('should rethrow the error', (_, error) => expect(error).toHaveProperty('message', 'Artificial'))
      .and('should keep the same snapshot', ({ snapshot, store }) => expect(store.getSnapshot()).toBe(snapshot))
      .and('should not update the node', ({ store }) =>
        expect(store.getSnapshot().get('_:m-1')).toHaveProperty('text', ['Hello'])
      )
      .and('should not add the node', ({ store }) => expect(store.getSnapshot().has('_:m-3')).toBe(false))
      .and('should not delete the node', ({ store }) => expect(store.getSnapshot().has('_:m-2')).toBe(true))
      .and('should not remove references', ({ store }) =>
        expect(store.getSnapshot().get('_:conversation')).toHaveProperty(
          'hasPart',
          new Set([{ '@id': '_:m-1' }, { '@id': '_:m-2' }])
        )
      )
      .and('should not notify', ({ numCalls }) => expect(numCalls.value).toBe(0));

    bdd
      .given('a store with cross-referencing nodes and a listener', () => {
        const { controller, store } = createStoreWithNodes();
        const numCalls = { value: 0 };

        store.subscribe(() => numCalls.value++);

        return { controller, numCalls, store, snapshot: store.getSnapshot() };
      })
      .when('the transaction succeed', ({ controller }) =>
        controller.edit(transaction => transaction.upsert('_:m-1', node => ({ ...node!, text: ['Aloha'] })))
      )
      .then('should have a new snapshot', ({ snapshot, store }) => expect(store.getSnapshot()).not.toBe(snapshot))
      .and('should notify once', ({ numCalls }) => expect(numCalls.value).toBe(1));
  },
  NodeTest
);
