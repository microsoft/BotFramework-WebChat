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

/**
 * Returns sorted IDs of nodes which exist in both snapshots but are different objects.
 */
/**
 * Gets a deeply nested value by following the path of keys, returns `undefined` if not found.
 */
function getPath(value: unknown, ...keys: readonly (number | string)[]): unknown {
  return keys.reduce<unknown>(
    (current, key) => (current && typeof current === 'object' ? Reflect.get(current, key) : undefined),
    value
  );
}

function getChangedNodeIds(before: ReadonlyMap<string, unknown>, after: ReadonlyMap<string, unknown>): string[] {
  return Array.from(after)
    .filter(([id, node]) => before.has(id) && before.get(id) !== node)
    .map(([id]) => id)
    .sort();
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
      .when('a node is deleted', ({ controller, store }) => {
        const snapshot = store.getSnapshot();

        controller.edit(transaction => transaction.delete('_:m-1'));

        return snapshot;
      })
      .then('should only modify nodes which referenced the deleted node', ({ store }, snapshot) =>
        expect(getChangedNodeIds(snapshot, store.getSnapshot())).toEqual(['_:conversation', '_:m-2'])
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
      .when('a node referenced by other nodes is deleted', ({ controller }) =>
        controller.edit(transaction => transaction.delete('_:conversation'))
      )
      .then('should remove isPartOf property', ({ store }) => {
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

scenario(
  'upsert with node reference',
  bdd => {
    bdd
      .given('an empty store', () => createStore())
      .when('a node with a full node in a property is upserted', ({ controller }) => {
        try {
          controller.edit(transaction =>
            transaction.upsert('_:m-1', () => ({
              '@id': '_:m-1',
              '@type': new Set(['Message']),
              mentions: [{ '@id': '_:p-1', '@type': ['Person'], name: ['John'] }]
            }))
          );
        } catch (error) {
          return error;
        }

        return undefined;
      })
      .then('should throw', (_, error) => expect(error).toEqual(expect.any(Error)))
      .and('should not add the node', ({ store }) => expect(store.getSnapshot().has('_:m-1')).toBe(false));

    bdd
      .given('an empty store', () => createStore())
      .when('a node with a full node in hasPart is upserted', ({ controller }) => {
        try {
          controller.edit(transaction =>
            transaction.upsert('_:conversation', () => ({
              '@id': '_:conversation',
              '@type': new Set(['Conversation']),
              hasPart: new Set([{ '@id': '_:m-1', '@type': ['Message'] }])
            }))
          );
        } catch (error) {
          return error;
        }

        return undefined;
      })
      .then('should throw', (_, error) => expect(error).toEqual(expect.any(Error)))
      .and('should not add the node', ({ store }) => expect(store.getSnapshot().has('_:conversation')).toBe(false));

    bdd
      .given('an empty store', () => createStore())
      .when('a node with a node reference is upserted', ({ controller }) =>
        controller.edit(transaction => {
          transaction.upsert('https://example.com/p-1', () => ({
            '@id': 'https://example.com/p-1',
            '@type': new Set(['Person'])
          }));

          transaction.upsert('_:m-1', () => ({
            '@id': '_:m-1',
            '@type': new Set(['Message']),
            mentions: [{ '@id': 'https://example.com/p-1' }]
          }));
        })
      )
      .then('should add the node', ({ store }) =>
        expect(store.getSnapshot().get('_:m-1')).toHaveProperty('mentions', [{ '@id': 'https://example.com/p-1' }])
      );
  },
  NodeTest
);

scenario(
  'reference tracking',
  bdd => {
    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a reference is removed by upsert, then the referenced node is deleted', ({ controller, store }) => {
        controller.edit(transaction => {
          transaction.upsert('_:m-2', node => {
            const { citation: _citation, mentions: _mentions, ...rest } = node!;

            return rest;
          });
        });

        const snapshot = store.getSnapshot();

        controller.edit(transaction => transaction.delete('_:m-1'));

        return snapshot;
      })
      .then('should only modify nodes which still reference it', ({ store }, snapshot) =>
        expect(getChangedNodeIds(snapshot, store.getSnapshot())).toEqual(['_:conversation'])
      );

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a reference is added by upsert, then the referenced node is deleted', ({ controller, store }) => {
        controller.edit(transaction => {
          transaction.upsert('_:m-3', () => ({
            '@id': '_:m-3',
            '@type': new Set(['Message']),
            mentions: [{ '@id': '_:m-2' }]
          }));
        });

        const snapshot = store.getSnapshot();

        controller.edit(transaction => transaction.delete('_:m-2'));

        return snapshot;
      })
      .then('should modify the newly referencing node', ({ store }, snapshot) =>
        expect(getChangedNodeIds(snapshot, store.getSnapshot())).toEqual(['_:conversation', '_:m-3'])
      )
      .and('should remove the reference from the new node', ({ store }) =>
        expect(store.getSnapshot().get('_:m-3')).not.toHaveProperty('mentions')
      );

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a failed transaction added a reference, then the referenced node is deleted', ({ controller, store }) => {
        try {
          controller.edit(transaction => {
            transaction.upsert('_:m-3', () => ({
              '@id': '_:m-3',
              '@type': new Set(['Message']),
              mentions: [{ '@id': '_:m-1' }]
            }));

            throw new Error('Artificial');
          });
        } catch {
          // Intentionally left blank.
        }

        const snapshot = store.getSnapshot();

        controller.edit(transaction => transaction.delete('_:m-1'));

        return snapshot;
      })
      .then('should not have the node from the failed transaction', ({ store }) =>
        expect(store.getSnapshot().has('_:m-3')).toBe(false)
      )
      .and('should only modify nodes which referenced it', ({ store }, snapshot) =>
        expect(getChangedNodeIds(snapshot, store.getSnapshot())).toEqual(['_:conversation', '_:m-2'])
      );

    bdd
      .given('a store with a self-referencing node', () => {
        const { controller, store } = createStore();

        controller.edit(transaction =>
          transaction.upsert('_:m-1', () => ({
            '@id': '_:m-1',
            '@type': new Set(['Message']),
            mentions: [{ '@id': '_:m-1' }]
          }))
        );

        return { controller, store };
      })
      .when('the node is deleted', ({ controller }) => controller.edit(transaction => transaction.delete('_:m-1')))
      .then('should remove the node', ({ store }) => expect(store.getSnapshot().size).toBe(0));
  },
  NodeTest
);

scenario(
  'deep freeze',
  bdd => {
    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a Set in a node is modified', ({ store }) => {
        const types = store.getSnapshot().get('_:m-2')?.['@type'];

        return [
          () => (types as Set<string>).add('Thing'),
          () => Set.prototype.add.call(types, 'Thing'),
          () => Set.prototype.clear.call(types)
        ];
      })
      .then('should throw', (_, modifiers) => {
        for (const modify of modifiers) {
          expect(modify).toThrow(TypeError);
        }
      })
      .and('should not be modified', ({ store }) =>
        expect(store.getSnapshot().get('_:m-2')?.['@type']).toEqual(new Set(['Message']))
      );

    bdd
      .given('a mutable Set', () => new Set(['Message']))
      .when('a node with the Set is upserted and the Set is modified afterward', types => {
        const { controller, store } = createStore();

        controller.edit(transaction => transaction.upsert('_:m-1', () => ({ '@id': '_:m-1', '@type': types })));

        types.add('Thing');

        return store;
      })
      .then('should not affect the node', (_, store) =>
        expect(store.getSnapshot().get('_:m-1')?.['@type']).toEqual(new Set(['Message']))
      );

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a node is retrieved', ({ store }) => store.getSnapshot().get('_:m-2'))
      .then('should freeze the node', (_, node) => expect(Object.isFrozen(node)).toBe(true))
      .and('should freeze property values', (_, node) => {
        expect(Object.isFrozen(getPath(node, '@type'))).toBe(true);
        expect(Object.isFrozen(getPath(node, 'citation'))).toBe(true);
        expect(Object.isFrozen(getPath(node, 'isPartOf'))).toBe(true);
      })
      .and('should freeze node references', (_, node) => {
        expect(Object.isFrozen(getPath(node, 'citation', 0))).toBe(true);
        expect(Object.isFrozen(getPath(Array.from(node?.isPartOf ?? []), 0))).toBe(true);
      });

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a referenced node is deleted', ({ controller, store }) => {
        controller.edit(transaction => transaction.delete('_:m-1'));

        return store.getSnapshot().get('_:m-2');
      })
      .then('should freeze the node with reference removed', (_, node) => {
        expect(Object.isFrozen(node)).toBe(true);
        expect(Object.isFrozen(getPath(node, 'citation'))).toBe(true);
      });

    bdd
      .given('a JSON literal', () => ({ '@type': '@json' as const, '@value': { nested: { value: [1, 2, 3] } } }))
      .when('a node with the JSON literal is upserted', jsonLiteral => {
        const { controller, store } = createStore();

        controller.edit(transaction =>
          transaction.upsert('_:m-1', () => ({ '@id': '_:m-1', '@type': new Set(['Message']), data: [jsonLiteral] }))
        );

        return getPath(store.getSnapshot().get('_:m-1'), 'data', 0);
      })
      .then('should freeze deeply into the JSON literal', (_, jsonLiteral) => {
        expect(Object.isFrozen(jsonLiteral)).toBe(true);
        expect(jsonLiteral).toEqual({ '@type': '@json', '@value': { nested: { value: [1, 2, 3] } } });

        expect(Object.isFrozen(getPath(jsonLiteral, '@value'))).toBe(true);
        expect(Object.isFrozen(getPath(jsonLiteral, '@value', 'nested'))).toBe(true);
        expect(Object.isFrozen(getPath(jsonLiteral, '@value', 'nested', 'value'))).toBe(true);
      });
  },
  NodeTest
);

scenario(
  'reference integrity',
  bdd => {
    bdd
      .given('a store with cross-referencing nodes', () => {
        const { controller, store } = createStoreWithNodes();

        return { controller, snapshot: store.getSnapshot(), store };
      })
      .when('a node referencing a non-existing blank node is upserted', ({ controller }) => {
        try {
          controller.edit(transaction =>
            transaction.upsert('_:m-3', () => ({
              '@id': '_:m-3',
              '@type': new Set(['Message']),
              mentions: [{ '@id': '_:p-1' }]
            }))
          );
        } catch (error) {
          return error;
        }

        return undefined;
      })
      .then('should throw', (_, error) => expect(error).toEqual(expect.any(Error)))
      .and('should not change the snapshot', ({ snapshot, store }) => expect(store.getSnapshot()).toBe(snapshot));

    bdd
      .given('an empty store', () => createStore())
      .when('nodes referencing each other are upserted over multiple calls in the same transaction', ({ controller }) =>
        controller.edit(transaction => {
          transaction.upsert('_:m-1', () => ({
            '@id': '_:m-1',
            '@type': new Set(['Message']),
            mentions: [{ '@id': '_:p-1' }]
          }));

          transaction.upsert('_:p-1', () => ({
            '@id': '_:p-1',
            '@type': new Set(['Person']),
            subjectOf: [{ '@id': '_:m-1' }]
          }));
        })
      )
      .then('should add both nodes', ({ store }) =>
        expect(Array.from(store.getSnapshot().keys()).sort()).toEqual(['_:m-1', '_:p-1'])
      );

    bdd
      .given('an empty store', () => createStore())
      .when('a node referencing a non-existing IRI node is upserted', ({ controller }) => {
        try {
          controller.edit(transaction =>
            transaction.upsert('_:m-1', () => ({
              '@id': '_:m-1',
              '@type': new Set(['Message']),
              mentions: [{ '@id': 'https://example.com/p-1' }]
            }))
          );
        } catch (error) {
          return error;
        }

        return undefined;
      })
      .then('should throw', (_, error) => expect(error).toEqual(expect.any(Error)))
      .and('should not add the node', ({ store }) => expect(store.getSnapshot().has('_:m-1')).toBe(false));

    bdd
      .given('an empty store', () => createStore())
      .when('a referenced IRI node is upserted in the same transaction', ({ controller }) =>
        controller.edit(transaction => {
          transaction.upsert('_:m-1', () => ({
            '@id': '_:m-1',
            '@type': new Set(['Message']),
            mentions: [{ '@id': 'https://example.com/p-1' }]
          }));

          transaction.upsert('https://example.com/p-1', () => ({
            '@id': 'https://example.com/p-1',
            '@type': new Set(['Person'])
          }));
        })
      )
      .then('should add both nodes', ({ store }) =>
        expect(Array.from(store.getSnapshot().keys()).sort()).toEqual(['_:m-1', 'https://example.com/p-1'])
      );

    bdd
      .given('an empty store', () => createStore())
      .when('a referenced blank node is upserted then deleted in the same transaction', ({ controller }) =>
        controller.edit(transaction => {
          transaction.upsert('_:p-1', () => ({ '@id': '_:p-1', '@type': new Set(['Person']) }));
          transaction.upsert('_:m-1', () => ({
            '@id': '_:m-1',
            '@type': new Set(['Message']),
            mentions: [{ '@id': '_:p-1' }]
          }));
          transaction.delete('_:p-1');
        })
      )
      .then('should remove the reference', ({ store }) =>
        expect(store.getSnapshot().get('_:m-1')).not.toHaveProperty('mentions')
      );
  },
  NodeTest
);
