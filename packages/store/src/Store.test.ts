import { scenario } from '@testduet/given-when-then';
import { expect } from 'expect';
import NodeTest from 'node:test';
import type { Node } from './node/Node.ts';
import Store, { type StoreController, type StoreTransaction } from './Store.ts';

function createStore() {
  let controller: StoreController | undefined;

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

function getPartIdsOf(
  storeOrSnapshot: Store | ReadonlyMap<string, Node>,
  id: string,
  property: 'hasPart' | 'isPartOf'
): string[] {
  const node = (storeOrSnapshot instanceof Store ? storeOrSnapshot.getSnapshot() : storeOrSnapshot).get(id);

  return Array.from((property === 'hasPart' ? node?.hasPart : node?.isPartOf) ?? [], ({ '@id': id }) => id).sort();
}

function catchError(fn: () => void): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }

  return undefined;
}

scenario(
  'part membership',
  bdd => {
    bdd
      .given('a store with a conversation', () => {
        const { controller, store } = createStore();

        controller.edit(transaction =>
          transaction.upsert('_:conversation', () => ({ '@id': '_:conversation', '@type': new Set(['Conversation']) }))
        );

        return { controller, store };
      })
      .when('a child node with isPartOf is upserted', ({ controller }) =>
        controller.edit(transaction =>
          transaction.upsert('_:m-1', () => ({
            '@id': '_:m-1',
            '@type': new Set(['Message']),
            isPartOf: new Set([{ '@id': '_:conversation' }])
          }))
        )
      )
      .then('should add the child to hasPart of the parent', ({ store }) =>
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-1'])
      )
      .and('should keep hasPart as an immutable Set', ({ store }) => {
        const hasPart = store.getSnapshot().get('_:conversation')?.hasPart;

        expect(hasPart).toBeInstanceOf(Set);
        expect(() => Set.prototype.clear.call(hasPart)).toThrow(TypeError);
      });

    bdd
      .given('a store with a message', () => {
        const { controller, store } = createStore();

        controller.edit(transaction =>
          transaction.upsert('_:m-1', () => ({ '@id': '_:m-1', '@type': new Set(['Message']) }))
        );

        return { controller, store };
      })
      .when('a parent node with hasPart is upserted', ({ controller }) =>
        controller.edit(transaction =>
          transaction.upsert('_:conversation', () => ({
            '@id': '_:conversation',
            '@type': new Set(['Conversation']),
            hasPart: new Set([{ '@id': '_:m-1' }])
          }))
        )
      )
      .then('should add the parent to isPartOf of the child', ({ store }) =>
        expect(getPartIdsOf(store, '_:m-1', 'isPartOf')).toEqual(['_:conversation'])
      );

    bdd
      .given('an empty store', () => createStore())
      .when('parent and children are upserted in the same transaction with one side declared', ({ controller }) =>
        controller.edit(transaction => {
          transaction.upsert('_:m-1', () => ({
            '@id': '_:m-1',
            '@type': new Set(['Message']),
            isPartOf: new Set([{ '@id': '_:conversation' }])
          }));

          transaction.upsert('_:conversation', () => ({
            '@id': '_:conversation',
            '@type': new Set(['Conversation']),
            hasPart: new Set([{ '@id': '_:m-2' }])
          }));

          transaction.upsert('_:m-2', () => ({ '@id': '_:m-2', '@type': new Set(['Message']) }));
        })
      )
      .then('should replace hasPart of the parent as the parent is upserted last', ({ store }) =>
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-2'])
      )
      .and('should mirror hasPart to isPartOf of children', ({ store }) => {
        expect(store.getSnapshot().get('_:m-1')).not.toHaveProperty('isPartOf');
        expect(getPartIdsOf(store, '_:m-2', 'isPartOf')).toEqual(['_:conversation']);
      });

    bdd
      .given('an empty store', () => createStore())
      .when('nested parts are upserted', ({ controller }) =>
        controller.edit(transaction => {
          transaction.upsert('_:conversation', () => ({ '@id': '_:conversation', '@type': new Set(['Conversation']) }));

          transaction.upsert('_:thread', () => ({
            '@id': '_:thread',
            '@type': new Set(['Conversation']),
            isPartOf: new Set([{ '@id': '_:conversation' }])
          }));

          transaction.upsert('_:m-1', () => ({
            '@id': '_:m-1',
            '@type': new Set(['Message']),
            isPartOf: new Set([{ '@id': '_:thread' }])
          }));
        })
      )
      .then('should allow a node to be both parent and child', ({ store }) => {
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:thread']);
        expect(getPartIdsOf(store, '_:thread', 'isPartOf')).toEqual(['_:conversation']);
        expect(getPartIdsOf(store, '_:thread', 'hasPart')).toEqual(['_:m-1']);
        expect(getPartIdsOf(store, '_:m-1', 'isPartOf')).toEqual(['_:thread']);
      });

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a child removes isPartOf', ({ controller }) =>
        controller.edit(transaction =>
          transaction.upsert('_:m-1', node => {
            const { isPartOf: _, ...rest } = node!;

            return rest;
          })
        )
      )
      .then('should remove the child from hasPart of the parent', ({ store }) =>
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-2'])
      );

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a parent removes all hasPart', ({ controller }) =>
        controller.edit(transaction =>
          transaction.upsert('_:conversation', node => {
            const { hasPart: _, ...rest } = node!;

            return rest;
          })
        )
      )
      .then('should remove isPartOf from all children', ({ store }) => {
        expect(store.getSnapshot().get('_:m-1')).not.toHaveProperty('isPartOf');
        expect(store.getSnapshot().get('_:m-2')).not.toHaveProperty('isPartOf');
      });

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('parent removes a child while the child re-declares the parent in the same transaction', ({ controller }) =>
        controller.edit(transaction => {
          transaction.upsert('_:conversation', node => ({ ...node!, hasPart: new Set([{ '@id': '_:m-2' }]) }));

          transaction.upsert('_:m-1', node => ({
            ...node!,
            isPartOf: new Set([{ '@id': '_:conversation' }]),
            text: ['Updated']
          }));
        })
      )
      .then('should keep the child as the child re-declared the parent last', ({ store }) => {
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-1', '_:m-2']);
        expect(getPartIdsOf(store, '_:m-1', 'isPartOf')).toEqual(['_:conversation']);
      });

    bdd
      .given('a store with a conversation and an orphan message', () => {
        const { controller, store } = createStore();

        controller.edit(transaction => {
          transaction.upsert('_:conversation', () => ({ '@id': '_:conversation', '@type': new Set(['Conversation']) }));
          transaction.upsert('_:m-1', () => ({ '@id': '_:m-1', '@type': new Set(['Message']) }));
        });

        return { controller, store };
      })
      .when('the child adds isPartOf while the parent removes hasPart in the same transaction', ({ controller }) =>
        controller.edit(transaction => {
          transaction.upsert('_:conversation', () => ({
            '@id': '_:conversation',
            '@type': new Set(['Conversation']),
            hasPart: new Set([{ '@id': '_:m-1' }])
          }));

          transaction.upsert('_:conversation', node => {
            const { hasPart: _, ...rest } = node!;

            return rest;
          });

          transaction.upsert('_:m-1', node => ({ ...node!, isPartOf: new Set([{ '@id': '_:conversation' }]) }));
        })
      )
      .then('addition should win', ({ store }) => {
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-1']);
        expect(getPartIdsOf(store, '_:m-1', 'isPartOf')).toEqual(['_:conversation']);
      });

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('the parent is deleted', ({ controller }) =>
        controller.edit(transaction => transaction.delete('_:conversation'))
      )
      .then('should remove isPartOf from all children', ({ store }) => {
        expect(store.getSnapshot().get('_:m-1')).not.toHaveProperty('isPartOf');
        expect(store.getSnapshot().get('_:m-2')).not.toHaveProperty('isPartOf');
      });

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a child is deleted', ({ controller }) => controller.edit(transaction => transaction.delete('_:m-1')))
      .then('should remove the child from hasPart of the parent', ({ store }) =>
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-2'])
      );

    bdd
      .given('a store with nested parts', () => {
        const { controller, store } = createStore();

        controller.edit(transaction => {
          transaction.upsert('_:conversation', () => ({ '@id': '_:conversation', '@type': new Set(['Conversation']) }));
          transaction.upsert('_:thread', () => ({
            '@id': '_:thread',
            '@type': new Set(['Conversation']),
            isPartOf: new Set([{ '@id': '_:conversation' }])
          }));
          transaction.upsert('_:m-1', () => ({
            '@id': '_:m-1',
            '@type': new Set(['Message']),
            isPartOf: new Set([{ '@id': '_:thread' }])
          }));
        });

        return { controller, store };
      })
      .when('the middle node is deleted', ({ controller }) =>
        controller.edit(transaction => transaction.delete('_:thread'))
      )
      .then('should remove hasPart from the parent', ({ store }) =>
        expect(store.getSnapshot().get('_:conversation')).not.toHaveProperty('hasPart')
      )
      .and('should remove isPartOf from the child', ({ store }) =>
        expect(store.getSnapshot().get('_:m-1')).not.toHaveProperty('isPartOf')
      );
  },
  NodeTest
);

scenario(
  'self part',
  bdd => {
    bdd
      .given('an empty store', () => createStore())
      .when('a node with itself in isPartOf is upserted', ({ controller }) =>
        catchError(() =>
          controller.edit(transaction =>
            transaction.upsert('_:m-1', () => ({
              '@id': '_:m-1',
              '@type': new Set(['Message']),
              isPartOf: new Set([{ '@id': '_:m-1' }])
            }))
          )
        )
      )
      .then('should throw', (_, error) => expect(error).toEqual(expect.any(Error)))
      .and('should not add the node', ({ store }) => expect(store.getSnapshot().size).toBe(0));

    bdd
      .given('an empty store', () => createStore())
      .when('a node with itself in hasPart is upserted', ({ controller }) =>
        catchError(() =>
          controller.edit(transaction =>
            transaction.upsert('_:m-1', () => ({
              '@id': '_:m-1',
              '@type': new Set(['Message']),
              hasPart: new Set([{ '@id': '_:m-1' }])
            }))
          )
        )
      )
      .then('should throw', (_, error) => expect(error).toEqual(expect.any(Error)))
      .and('should not add the node', ({ store }) => expect(store.getSnapshot().size).toBe(0));
  },
  NodeTest
);

scenario(
  'position',
  bdd => {
    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('members of the same part have different positions', ({ controller }) =>
        controller.edit(transaction => {
          transaction.upsert('_:m-1', node => ({ ...node!, position: 1 }));
          transaction.upsert('_:m-2', node => ({ ...node!, position: 2 }));
        })
      )
      .then('should update the nodes', ({ store }) => {
        expect(store.getSnapshot().get('_:m-1')).toHaveProperty('position', 1);
        expect(store.getSnapshot().get('_:m-2')).toHaveProperty('position', 2);
      });

    bdd
      .given('a store with cross-referencing nodes', () => {
        const { controller, store } = createStoreWithNodes();

        controller.edit(transaction => transaction.upsert('_:m-1', node => ({ ...node!, position: 1 })));

        return { controller, snapshot: store.getSnapshot(), store };
      })
      .when('another member of the same part is upserted with the same position', ({ controller }) =>
        catchError(() =>
          controller.edit(transaction => transaction.upsert('_:m-2', node => ({ ...node!, position: 1 })))
        )
      )
      .then('should throw', (_, error) => expect(error).toEqual(expect.any(Error)))
      .and('should not change the snapshot', ({ snapshot, store }) => expect(store.getSnapshot()).toBe(snapshot));

    bdd
      .given('a store with a conversation with a positioned member', () => {
        const { controller, store } = createStoreWithNodes();

        controller.edit(transaction => transaction.upsert('_:m-1', node => ({ ...node!, position: 1 })));

        return { controller, snapshot: store.getSnapshot(), store };
      })
      .when('a new member with the same position joins the part via hasPart of the parent', ({ controller }) =>
        catchError(() =>
          controller.edit(transaction => {
            transaction.upsert('_:m-3', () => ({ '@id': '_:m-3', '@type': new Set(['Message']), position: 1 }));
            transaction.upsert('_:conversation', node => ({
              ...node!,
              hasPart: new Set([...node!.hasPart!, { '@id': '_:m-3' }])
            }));
          })
        )
      )
      .then('should throw', (_, error) => expect(error).toEqual(expect.any(Error)))
      .and('should not change the snapshot', ({ snapshot, store }) => expect(store.getSnapshot()).toBe(snapshot));

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('members without position and a member with position are in the same part', ({ controller }) =>
        controller.edit(transaction => {
          transaction.upsert('_:m-3', () => ({
            '@id': '_:m-3',
            '@type': new Set(['Message']),
            isPartOf: new Set([{ '@id': '_:conversation' }]),
            position: 1
          }));
        })
      )
      .then('should allow members without position', ({ store }) =>
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-1', '_:m-2', '_:m-3'])
      );

    bdd
      .given('two conversations each with a positioned member', () => {
        const { controller, store } = createStore();

        controller.edit(transaction => {
          transaction.upsert('_:c-1', () => ({ '@id': '_:c-1', '@type': new Set(['Conversation']) }));
          transaction.upsert('_:c-2', () => ({ '@id': '_:c-2', '@type': new Set(['Conversation']) }));
          transaction.upsert('_:m-1', () => ({
            '@id': '_:m-1',
            '@type': new Set(['Message']),
            isPartOf: new Set([{ '@id': '_:c-1' }]),
            position: 1
          }));
        });

        return { controller, store };
      })
      .when('a member of another part has the same position', ({ controller }) =>
        controller.edit(transaction =>
          transaction.upsert('_:m-2', () => ({
            '@id': '_:m-2',
            '@type': new Set(['Message']),
            isPartOf: new Set([{ '@id': '_:c-2' }]),
            position: 1
          }))
        )
      )
      .then('should allow same position in different parts', ({ store }) =>
        expect(store.getSnapshot().get('_:m-2')).toHaveProperty('position', 1)
      );

    bdd
      .given('a store with a conversation', () => {
        const { controller, store } = createStore();

        controller.edit(transaction =>
          transaction.upsert('_:conversation', () => ({ '@id': '_:conversation', '@type': new Set(['Conversation']) }))
        );

        return { controller, store };
      })
      .when('a child is upserted and the parent is read in the same transaction', ({ controller }) => {
        let parentInTransaction: unknown;

        controller.edit(transaction => {
          transaction.upsert('_:m-1', () => ({
            '@id': '_:m-1',
            '@type': new Set(['Message']),
            isPartOf: new Set([{ '@id': '_:conversation' }])
          }));

          transaction.upsert('_:conversation', node => {
            parentInTransaction = node;

            return node!;
          });
        });

        return parentInTransaction;
      })
      .then('should reflect the child inside the transaction', (_, parentInTransaction) =>
        expect(Array.from((parentInTransaction as Node).hasPart ?? [])).toEqual([{ '@id': '_:m-1' }])
      )
      .and('should commit', ({ store }) => expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-1']));

    bdd
      .given('a store with a conversation and a listener', () => {
        const { controller, store } = createStore();
        const changedNodeIds: string[][] = [];

        controller.edit(transaction =>
          transaction.upsert('_:conversation', () => ({ '@id': '_:conversation', '@type': new Set(['Conversation']) }))
        );

        store.subscribe(affectedNodeIds => changedNodeIds.push(Array.from(affectedNodeIds).sort()));

        return { changedNodeIds, controller, store };
      })
      .when('many children are upserted in a single transaction', ({ controller }) =>
        controller.edit(transaction => {
          for (let index = 1; index <= 3; index++) {
            transaction.upsert(`_:m-${index}`, () => ({
              '@id': `_:m-${index}`,
              '@type': new Set(['Message']),
              isPartOf: new Set([{ '@id': '_:conversation' }]),
              position: index
            }));
          }
        })
      )
      .then('should add all children to the parent', ({ store }) =>
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-1', '_:m-2', '_:m-3'])
      )
      .and('should notify once with all affected nodes', ({ changedNodeIds }) =>
        expect(changedNodeIds).toEqual([['_:conversation', '_:m-1', '_:m-2', '_:m-3']])
      );

    bdd
      .given('a store with cross-referencing nodes', () => {
        const { controller, store } = createStoreWithNodes();

        return { controller, store };
      })
      .when('a child is moved to a new parent in a single transaction', ({ controller }) =>
        controller.edit(transaction => {
          transaction.upsert('_:thread', () => ({ '@id': '_:thread', '@type': new Set(['Thread']) }));
          transaction.upsert('_:m-1', node => ({ ...node!, isPartOf: new Set([{ '@id': '_:thread' }]) }));
          transaction.upsert('_:m-2', node => ({ ...node!, isPartOf: new Set([{ '@id': '_:thread' }]) }));
        })
      )
      .then('should remove all children from the old parent', ({ store }) =>
        expect(store.getSnapshot().get('_:conversation')).not.toHaveProperty('hasPart')
      )
      .and('should add all children to the new parent', ({ store }) =>
        expect(getPartIdsOf(store, '_:thread', 'hasPart')).toEqual(['_:m-1', '_:m-2'])
      );
  },
  NodeTest
);

function upsertMessage(transaction: StoreTransaction, id: `_:${string}`, parentId?: `_:${string}` | undefined): void {
  transaction.upsert(id, () => ({
    '@id': id,
    '@type': new Set(['Message']),
    ...(parentId ? { isPartOf: new Set([{ '@id': parentId }]) } : {})
  }));
}

scenario(
  'part membership mirroring',
  bdd => {
    bdd
      .given('a store with a conversation', () => {
        const { controller, store } = createStore();

        controller.edit(transaction =>
          transaction.upsert('_:conversation', () => ({ '@id': '_:conversation', '@type': new Set(['Conversation']) }))
        );

        return { controller, snapshot: store.getSnapshot(), store };
      })
      .when('a child node with isPartOf only is upserted', ({ controller }) =>
        controller.edit(transaction => upsertMessage(transaction, '_:m-1', '_:conversation'))
      )
      .then('should generate hasPart of the parent', ({ store }) =>
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-1'])
      )
      .and('should keep the parent in the previous snapshot unchanged', ({ snapshot }) =>
        expect(snapshot.get('_:conversation')).not.toHaveProperty('hasPart')
      );

    bdd
      .given('a store with a message', () => {
        const { controller, store } = createStore();

        controller.edit(transaction => upsertMessage(transaction, '_:m-1'));

        return { controller, snapshot: store.getSnapshot(), store };
      })
      .when('a parent node with hasPart only is upserted', ({ controller }) =>
        controller.edit(transaction =>
          transaction.upsert('_:conversation', () => ({
            '@id': '_:conversation',
            '@type': new Set(['Conversation']),
            hasPart: new Set([{ '@id': '_:m-1' }])
          }))
        )
      )
      .then('should mirror hasPart to isPartOf of the child', ({ store }) =>
        expect(getPartIdsOf(store, '_:m-1', 'isPartOf')).toEqual(['_:conversation'])
      )
      .and('should keep hasPart of the parent', ({ store }) =>
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-1'])
      )
      .and('should keep the child in the previous snapshot unchanged', ({ snapshot }) =>
        expect(snapshot.get('_:m-1')).not.toHaveProperty('isPartOf')
      );

    bdd
      .given('an empty store', () => createStore())
      .when('a parent with hasPart is upserted before its child in the same transaction', ({ controller }) =>
        controller.edit(transaction => {
          transaction.upsert('_:conversation', () => ({
            '@id': '_:conversation',
            '@type': new Set(['Conversation']),
            hasPart: new Set([{ '@id': '_:m-1' }])
          }));

          upsertMessage(transaction, '_:m-1');
        })
      )
      .then('should add the parent to isPartOf of the child when the child is upserted', ({ store }) => {
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-1']);
        expect(getPartIdsOf(store, '_:m-1', 'isPartOf')).toEqual(['_:conversation']);
      });

    bdd
      .given('a store with a conversation', () => {
        const { controller, store } = createStore();

        controller.edit(transaction =>
          transaction.upsert('_:conversation', () => ({ '@id': '_:conversation', '@type': new Set(['Conversation']) }))
        );

        return { controller, snapshot: store.getSnapshot(), store };
      })
      .when('a parent has a child which is never upserted', ({ controller }) =>
        catchError(() =>
          controller.edit(transaction =>
            transaction.upsert('_:conversation', node => ({ ...node!, hasPart: new Set([{ '@id': '_:m-1' }]) }))
          )
        )
      )
      .then('should throw', (_, error) =>
        expect(error).toHaveProperty('message', 'Node "_:conversation" has part "_:m-1" which is not in the graph')
      )
      .and('should not change the snapshot', ({ snapshot, store }) => expect(store.getSnapshot()).toBe(snapshot));

    bdd
      .given('a store with a conversation', () => {
        const { controller, store } = createStore();

        controller.edit(transaction =>
          transaction.upsert('_:conversation', () => ({ '@id': '_:conversation', '@type': new Set(['Conversation']) }))
        );

        return { controller, store };
      })
      .when('a parent has a child which is never upserted, then deleted', ({ controller }) =>
        controller.edit(transaction => {
          transaction.upsert('_:conversation', node => ({ ...node!, hasPart: new Set([{ '@id': '_:m-1' }]) }));
          transaction.delete('_:m-1');
        })
      )
      .then('should remove the child from hasPart', ({ store }) =>
        expect(store.getSnapshot().get('_:conversation')).not.toHaveProperty('hasPart')
      );

    bdd
      .given('a store with cross-referencing nodes', () => {
        const { controller, store } = createStoreWithNodes();

        return { controller, snapshot: store.getSnapshot(), store };
      })
      .when('a parent removes a child from hasPart', ({ controller }) =>
        controller.edit(transaction =>
          transaction.upsert('_:conversation', node => ({ ...node!, hasPart: new Set([{ '@id': '_:m-2' }]) }))
        )
      )
      .then('should remove isPartOf from the child', ({ store }) => {
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-2']);
        expect(store.getSnapshot().get('_:m-1')).not.toHaveProperty('isPartOf');
      })
      .and('should keep the previous snapshot unchanged', ({ snapshot }) => {
        expect(getPartIdsOf(snapshot, '_:conversation', 'hasPart')).toEqual(['_:m-1', '_:m-2']);
        expect(getPartIdsOf(snapshot, '_:m-1', 'isPartOf')).toEqual(['_:conversation']);
      });

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a child removes isPartOf', ({ controller }) =>
        controller.edit(transaction =>
          transaction.upsert('_:m-1', node => {
            const { isPartOf: _, ...rest } = node!;

            return rest;
          })
        )
      )
      .then('should remove the child from hasPart of the parent', ({ store }) =>
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-2'])
      );

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a child is moved to another parent', ({ controller }) =>
        controller.edit(transaction => {
          transaction.upsert('_:thread', () => ({ '@id': '_:thread', '@type': new Set(['Thread']) }));
          transaction.upsert('_:m-1', node => ({ ...node!, isPartOf: new Set([{ '@id': '_:thread' }]) }));
        })
      )
      .then('should move the child', ({ store }) => {
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-2']);
        expect(getPartIdsOf(store, '_:thread', 'hasPart')).toEqual(['_:m-1']);
        expect(getPartIdsOf(store, '_:m-1', 'isPartOf')).toEqual(['_:thread']);
      });

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a child is part of two parents', ({ controller }) =>
        controller.edit(transaction => {
          transaction.upsert('_:thread', () => ({ '@id': '_:thread', '@type': new Set(['Thread']) }));
          transaction.upsert('_:m-1', node => ({
            ...node!,
            isPartOf: new Set([{ '@id': '_:conversation' }, { '@id': '_:thread' }])
          }));
        })
      )
      .then('should be in hasPart of both parents', ({ store }) => {
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-1', '_:m-2']);
        expect(getPartIdsOf(store, '_:thread', 'hasPart')).toEqual(['_:m-1']);
      });

    bdd
      .given('a store with cross-referencing nodes', () => {
        const { controller, store } = createStoreWithNodes();

        return { controller, snapshot: store.getSnapshot(), store };
      })
      .when('a parent is updated with spread', ({ controller }) =>
        controller.edit(transaction =>
          transaction.upsert('_:conversation', node => ({ ...node!, name: ['Conversation'] }))
        )
      )
      .then('should keep hasPart', ({ store }) =>
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-1', '_:m-2'])
      )
      .and('should not change children', ({ snapshot, store }) =>
        expect(getChangedNodeIds(snapshot, store.getSnapshot())).toEqual(['_:conversation'])
      );

    bdd
      .given('a store with cross-referencing nodes', () => {
        const { controller, store } = createStoreWithNodes();

        return { controller, snapshot: store.getSnapshot(), store };
      })
      .when('a child is updated without touching part relationships', ({ controller }) =>
        controller.edit(transaction => transaction.upsert('_:m-2', node => ({ ...node!, text: ['Updated'] })))
      )
      .then('should update the child', ({ store }) =>
        expect(store.getSnapshot().get('_:m-2')).toHaveProperty('text', ['Updated'])
      )
      .and('should keep part membership', ({ store }) => {
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-1', '_:m-2']);
        expect(getPartIdsOf(store, '_:m-2', 'isPartOf')).toEqual(['_:conversation']);
      })
      .and('should not change the parent', ({ snapshot, store }) =>
        expect(getChangedNodeIds(snapshot, store.getSnapshot())).toEqual(['_:m-2'])
      );

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('the parent is deleted', ({ controller }) =>
        controller.edit(transaction => transaction.delete('_:conversation'))
      )
      .then('should remove isPartOf from all children', ({ store }) => {
        expect(store.getSnapshot().get('_:m-1')).not.toHaveProperty('isPartOf');
        expect(store.getSnapshot().get('_:m-2')).not.toHaveProperty('isPartOf');
      });

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a child is deleted', ({ controller }) => controller.edit(transaction => transaction.delete('_:m-1')))
      .then('should remove the child from hasPart of the parent', ({ store }) =>
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-2'])
      );

    bdd
      .given('a store with cross-referencing nodes', () => {
        const { controller, store } = createStoreWithNodes();

        controller.edit(transaction => transaction.upsert('_:m-1', node => ({ ...node!, position: 1 })));

        return { controller, snapshot: store.getSnapshot(), store };
      })
      .when('another member is upserted with the same position', ({ controller }) =>
        catchError(() =>
          controller.edit(transaction => transaction.upsert('_:m-2', node => ({ ...node!, position: 1 })))
        )
      )
      .then('should throw', (_, error) => expect(error).toEqual(expect.any(Error)))
      .and('should not change the snapshot', ({ snapshot, store }) => expect(store.getSnapshot()).toBe(snapshot));

    bdd
      .given('an empty store', () => createStore())
      .when('edit is called with a transactor which is not a function', ({ controller }) =>
        catchError(() => controller.edit('transactor' as unknown as Parameters<StoreController['edit']>[0]))
      )
      .then('should throw', (_, error) => expect(error).toEqual(expect.any(TypeError)))
      .and('should not change the store', ({ store }) => expect(store.getSnapshot().size).toBe(0));

    bdd
      .given('an empty store', () => createStore())
      .when('the transaction is used after edit() returns', ({ controller }) => {
        let leakedTransaction: StoreTransaction | undefined;

        controller.edit(transaction => {
          leakedTransaction = transaction;
          upsertMessage(transaction, '_:m-1');
        });

        return [() => leakedTransaction!.delete('_:m-1'), () => upsertMessage(leakedTransaction!, '_:m-2')];
      })
      .then('should throw', (_, calls) => {
        for (const call of calls) {
          expect(call).toThrow('Transaction has ended');
        }
      })
      .and('should not change the store', ({ store }) =>
        expect(Array.from(store.getSnapshot().keys())).toEqual(['_:m-1'])
      );
  },
  NodeTest
);

scenario(
  'generated hasPart',
  bdd => {
    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('the parent is read', ({ store }) => store.getSnapshot().get('_:conversation'))
      .then('should have an enumerable hasPart', (_, parent) =>
        expect(Object.keys(parent!)).toEqual(expect.arrayContaining(['hasPart']))
      )
      .and('should appear in spread', (_, parent) =>
        expect({ ...parent }).toHaveProperty('hasPart', new Set([{ '@id': '_:m-1' }, { '@id': '_:m-2' }]))
      )
      .and('should appear in JSON', (_, parent) =>
        expect(
          JSON.parse(JSON.stringify(parent, (_, value) => (value instanceof Set ? Array.from(value) : value)))
        ).toEqual({
          '@id': '_:conversation',
          '@type': ['Conversation'],
          hasPart: [{ '@id': '_:m-1' }, { '@id': '_:m-2' }]
        })
      )
      .and('should return the same Set on every access', (_, parent) => expect(parent!.hasPart).toBe(parent!.hasPart))
      .and('should be immutable', (_, parent) => {
        expect(Object.isFrozen(parent)).toBe(true);
        expect(() => Set.prototype.clear.call(parent!.hasPart)).toThrow(TypeError);
      });
  },
  NodeTest
);

scenario(
  'subscribe',
  bdd => {
    bdd
      .given('a store with cross-referencing nodes and a listener', () => {
        const { controller, store } = createStoreWithNodes();
        const calls: ReadonlySet<string>[] = [];

        store.subscribe(affectedNodeIds => calls.push(affectedNodeIds));

        return { calls, controller, store };
      })
      .when('a node is upserted', ({ controller }) =>
        controller.edit(transaction => transaction.upsert('_:m-1', node => ({ ...node!, text: ['Aloha'] })))
      )
      .then('should notify once with the upserted node ID', ({ calls }) =>
        expect(calls.map(ids => Array.from(ids))).toEqual([['_:m-1']])
      );

    bdd
      .given('a store with cross-referencing nodes and a listener', () => {
        const { controller, store } = createStoreWithNodes();
        const calls: ReadonlySet<string>[] = [];

        store.subscribe(affectedNodeIds => calls.push(affectedNodeIds));

        return { calls, controller, store };
      })
      .when('a referenced node is deleted', ({ controller }) =>
        controller.edit(transaction => transaction.delete('_:m-1'))
      )
      .then('should notify with the deleted node and nodes which references are removed', ({ calls }) =>
        expect(calls.map(ids => Array.from(ids).sort())).toEqual([['_:conversation', '_:m-1', '_:m-2']])
      );

    bdd
      .given('a store with a conversation and a listener', () => {
        const { controller, store } = createStore();
        const calls: ReadonlySet<string>[] = [];

        controller.edit(transaction =>
          transaction.upsert('_:conversation', () => ({ '@id': '_:conversation', '@type': new Set(['Conversation']) }))
        );

        store.subscribe(affectedNodeIds => calls.push(affectedNodeIds));

        return { calls, controller, store };
      })
      .when('a child is upserted', ({ controller }) =>
        controller.edit(transaction =>
          transaction.upsert('_:m-1', () => ({
            '@id': '_:m-1',
            '@type': new Set(['Message']),
            isPartOf: new Set([{ '@id': '_:conversation' }])
          }))
        )
      )
      .then('should include the parent with generated hasPart', ({ calls }) =>
        expect(calls.map(ids => Array.from(ids).sort())).toEqual([['_:conversation', '_:m-1']])
      );

    bdd
      .given('a store with cross-referencing nodes and a listener', () => {
        const { controller, store } = createStoreWithNodes();
        const calls: ReadonlySet<string>[] = [];

        store.subscribe(affectedNodeIds => calls.push(affectedNodeIds));

        controller.edit(transaction => transaction.upsert('_:m-1', node => ({ ...node!, text: ['Aloha'] })));

        return calls[0];
      })
      .when('the affected node IDs are modified', affectedNodeIds => [
        () => (affectedNodeIds as Set<string>).add('_:m-2'),
        () => Set.prototype.clear.call(affectedNodeIds)
      ])
      .then('should throw', (_, modifiers) => {
        for (const modify of modifiers) {
          expect(modify).toThrow(TypeError);
        }
      })
      .and('should not be modified', affectedNodeIds => expect(Array.from(affectedNodeIds ?? [])).toEqual(['_:m-1']));

    bdd
      .given('a store with cross-referencing nodes and two listeners', () => {
        const { controller, store } = createStoreWithNodes();
        const calls: ReadonlySet<string>[] = [];

        store.subscribe(affectedNodeIds => calls.push(affectedNodeIds));
        store.subscribe(affectedNodeIds => calls.push(affectedNodeIds));

        return { calls, controller, store };
      })
      .when('a node is upserted', ({ controller }) =>
        controller.edit(transaction => transaction.upsert('_:m-1', node => ({ ...node!, text: ['Aloha'] })))
      )
      .then('should notify both listeners', ({ calls }) => expect(calls).toHaveLength(2));

    bdd
      .given('a store with cross-referencing nodes and an unsubscribed listener', () => {
        const { controller, store } = createStoreWithNodes();
        const calls: ReadonlySet<string>[] = [];

        store.subscribe(affectedNodeIds => calls.push(affectedNodeIds))();

        return { calls, controller, store };
      })
      .when('a node is upserted', ({ controller }) =>
        controller.edit(transaction => transaction.upsert('_:m-1', node => ({ ...node!, text: ['Aloha'] })))
      )
      .then('should not notify', ({ calls }) => expect(calls).toHaveLength(0));

    bdd
      .given('an empty store', () => createStore())
      .when('subscribe is called with a non-function', ({ store }) =>
        catchError(() => store.subscribe('not a function' as unknown as () => void))
      )
      .then('should throw', (_, error) => expect(error).toEqual(expect.any(TypeError)));
  },
  NodeTest
);

scenario(
  'snapshot',
  bdd => {
    bdd
      .given('a store with cross-referencing nodes', () => {
        const { controller, store } = createStoreWithNodes();

        return { controller, snapshots: [store.getSnapshot()], store };
      })
      .when('multiple transactions succeed', ({ controller, snapshots, store }) => {
        controller.edit(transaction => transaction.upsert('_:m-1', node => ({ ...node!, text: ['Aloha'] })));
        snapshots.push(store.getSnapshot());

        controller.edit(transaction => transaction.delete('_:m-2'));
        snapshots.push(store.getSnapshot());

        controller.edit(transaction => {
          transaction.upsert('_:m-3', () => ({
            '@id': '_:m-3',
            '@type': new Set(['Message']),
            isPartOf: new Set([{ '@id': '_:conversation' }])
          }));
        });
        snapshots.push(store.getSnapshot());

        return snapshots;
      })
      .then('every snapshot should keep its own nodes', (_, snapshots) =>
        expect(snapshots.map(snapshot => Array.from(snapshot.keys()).sort())).toEqual([
          ['_:conversation', '_:m-1', '_:m-2'],
          ['_:conversation', '_:m-1', '_:m-2'],
          ['_:conversation', '_:m-1'],
          ['_:conversation', '_:m-1', '_:m-3']
        ])
      )
      .and('every snapshot should keep its own node values', (_, snapshots) => {
        expect(snapshots.map(snapshot => snapshot.get('_:m-1'))).toEqual([
          expect.objectContaining({ text: ['Hello'] }),
          expect.objectContaining({ text: ['Aloha'] }),
          expect.objectContaining({ text: ['Aloha'] }),
          expect.objectContaining({ text: ['Aloha'] })
        ]);
        expect(snapshots.map(snapshot => getPartIdsOf(snapshot, '_:conversation', 'hasPart'))).toEqual([
          ['_:m-1', '_:m-2'],
          ['_:m-1', '_:m-2'],
          ['_:m-1'],
          ['_:m-1', '_:m-3']
        ]);
      })
      .and('every snapshot should have the size of its own', (_, snapshots) =>
        expect(snapshots.map(snapshot => snapshot.size)).toEqual([3, 3, 2, 3])
      )
      .and('snapshot should be read-only', (_, snapshots) =>
        expect(() => (snapshots[0] as Map<string, unknown>).set('_:m-9', {})).toThrow(TypeError)
      );

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when(
        'a node referenced by another node is deleted in a failed transaction, then in a successful one',
        ({ controller, store }) => {
          catchError(() =>
            controller.edit(transaction => {
              transaction.delete('_:m-1');

              throw new Error('Artificial');
            })
          );

          controller.edit(transaction => transaction.delete('_:m-1'));

          return store.getSnapshot();
        }
      )
      .then('should remove references to the deleted node', (_, snapshot) => {
        expect(getPartIdsOf(snapshot, '_:conversation', 'hasPart')).toEqual(['_:m-2']);
        expect(snapshot.get('_:m-2')).not.toHaveProperty('citation', expect.arrayContaining([{ '@id': '_:m-1' }]));
        expect(snapshot.get('_:m-2')).not.toHaveProperty('mentions');
      });
  },
  NodeTest
);

function upsertDatedMessage(
  transaction: StoreTransaction,
  id: `_:${string}`,
  parentIds: readonly `_:${string}`[],
  dateCreated?: number | undefined
): void {
  transaction.upsert(id, () => ({
    '@id': id,
    '@type': new Set(['Message']),
    ...(typeof dateCreated === 'number' ? { dateCreated } : {}),
    isPartOf: new Set(parentIds.map(parentId => ({ '@id': parentId })))
  }));
}

function createStoreWithConversations() {
  const { controller, store } = createStore();

  controller.edit(transaction => {
    transaction.upsert('_:c-1', () => ({ '@id': '_:c-1', '@type': new Set(['Conversation']) }));
    transaction.upsert('_:c-2', () => ({ '@id': '_:c-2', '@type': new Set(['Conversation']) }));
  });

  return { controller, store };
}

function getSortedChildIdsOf(store: Store, parentId: `_:${string}`): string[] {
  return store.getSortedChildren(store.getSnapshot().get(parentId)!).map(child => child['@id']);
}

scenario(
  'getSortedChildren',
  bdd => {
    bdd
      .given('a store with conversations', () => createStoreWithConversations())
      .when('children are added out of order', ({ controller }) =>
        controller.edit(transaction => {
          upsertDatedMessage(transaction, '_:m-3', ['_:c-1'], 3);
          upsertDatedMessage(transaction, '_:m-1', ['_:c-1'], 1);
          upsertDatedMessage(transaction, '_:m-2', ['_:c-1'], 2);
        })
      )
      .then('should sort by dateCreated', ({ store }) =>
        expect(getSortedChildIdsOf(store, '_:c-1')).toEqual(['_:m-1', '_:m-2', '_:m-3'])
      )
      .and('should return the children nodes', ({ store }) => {
        const snapshot = store.getSnapshot();

        expect(store.getSortedChildren(snapshot.get('_:c-1')!)).toEqual([
          snapshot.get('_:m-1'),
          snapshot.get('_:m-2'),
          snapshot.get('_:m-3')
        ]);
      })
      .and('should not affect other parent', ({ store }) => expect(getSortedChildIdsOf(store, '_:c-2')).toEqual([]));

    bdd
      .given('a store with conversations', () => createStoreWithConversations())
      .when('children are added in multiple transactions out of order', ({ controller }) => {
        for (const dateCreated of [5, 1, 4, 2, 3]) {
          controller.edit(transaction => upsertDatedMessage(transaction, `_:m-${dateCreated}`, ['_:c-1'], dateCreated));
        }
      })
      .then('should sort by dateCreated', ({ store }) =>
        expect(getSortedChildIdsOf(store, '_:c-1')).toEqual(['_:m-1', '_:m-2', '_:m-3', '_:m-4', '_:m-5'])
      );

    bdd
      .given('a store with conversations', () => createStoreWithConversations())
      .when('children without dateCreated are added', ({ controller }) =>
        controller.edit(transaction => {
          upsertDatedMessage(transaction, '_:m-b', ['_:c-1']);
          upsertDatedMessage(transaction, '_:m-2', ['_:c-1'], 2);
          upsertDatedMessage(transaction, '_:m-a', ['_:c-1']);
          upsertDatedMessage(transaction, '_:m-1', ['_:c-1'], 1);
        })
      )
      .then('should put them at the end, sorted by @id', ({ store }) =>
        expect(getSortedChildIdsOf(store, '_:c-1')).toEqual(['_:m-1', '_:m-2', '_:m-a', '_:m-b'])
      );

    bdd
      .given('a store with conversations', () => createStoreWithConversations())
      .when('children sharing same dateCreated are added', ({ controller }) => {
        controller.edit(transaction => upsertDatedMessage(transaction, '_:m-c', ['_:c-1'], 1));
        controller.edit(transaction => upsertDatedMessage(transaction, '_:m-a', ['_:c-1'], 1));
        controller.edit(transaction => upsertDatedMessage(transaction, '_:m-0', ['_:c-1'], 2));
        controller.edit(transaction => upsertDatedMessage(transaction, '_:m-b', ['_:c-1'], 1));
      })
      .then('should sort them by @id', ({ store }) =>
        expect(getSortedChildIdsOf(store, '_:c-1')).toEqual(['_:m-a', '_:m-b', '_:m-c', '_:m-0'])
      );

    bdd
      .given('a store with 3 sorted children', () => {
        const { controller, store } = createStoreWithConversations();

        controller.edit(transaction => {
          upsertDatedMessage(transaction, '_:m-1', ['_:c-1'], 1);
          upsertDatedMessage(transaction, '_:m-2', ['_:c-1'], 2);
          upsertDatedMessage(transaction, '_:m-3', ['_:c-1'], 3);
        });

        return { controller, parent: store.getSnapshot().get('_:c-1')!, store };
      })
      .when('dateCreated of a child is changed', ({ controller }) =>
        controller.edit(transaction => upsertDatedMessage(transaction, '_:m-1', ['_:c-1'], 4))
      )
      .then('should re-sort', ({ store }) =>
        expect(getSortedChildIdsOf(store, '_:c-1')).toEqual(['_:m-2', '_:m-3', '_:m-1'])
      )
      .and('should keep the parent in previous snapshot unchanged', ({ parent, store }) =>
        expect(store.getSortedChildren(parent).map(child => child['@id'])).toEqual(['_:m-2', '_:m-3', '_:m-1'])
      );

    bdd
      .given('a store with 3 sorted children and a result of getSortedChildren()', () => {
        const { controller, store } = createStoreWithConversations();

        controller.edit(transaction => {
          upsertDatedMessage(transaction, '_:m-1', ['_:c-1'], 1);
          upsertDatedMessage(transaction, '_:m-2', ['_:c-1'], 2);
          upsertDatedMessage(transaction, '_:m-3', ['_:c-1'], 3);
        });

        const snapshot = store.getSnapshot();

        return { children: store.getSortedChildren(snapshot.get('_:c-1')!), controller, snapshot, store };
      })
      .when('a child is removed, a child is deleted, and a child is added', ({ controller }) =>
        controller.edit(transaction => {
          upsertDatedMessage(transaction, '_:m-1', [], 1);
          transaction.delete('_:m-2');
          upsertDatedMessage(transaction, '_:m-0', ['_:c-1'], 0);
        })
      )
      .then('should update the sorted children', ({ store }) =>
        expect(getSortedChildIdsOf(store, '_:c-1')).toEqual(['_:m-0', '_:m-3'])
      )
      .and('should keep the earlier result unchanged', ({ children, snapshot }) =>
        expect(children).toEqual([snapshot.get('_:m-1'), snapshot.get('_:m-2'), snapshot.get('_:m-3')])
      );

    bdd
      .given('a store with a child in a conversation', () => {
        const { controller, store } = createStoreWithConversations();

        controller.edit(transaction => upsertDatedMessage(transaction, '_:m-1', ['_:c-1'], 1));

        return { controller, store };
      })
      .when('the child is moved to another conversation', ({ controller }) =>
        controller.edit(transaction => upsertDatedMessage(transaction, '_:m-1', ['_:c-2'], 1))
      )
      .then('should remove from the previous parent', ({ store }) =>
        expect(getSortedChildIdsOf(store, '_:c-1')).toEqual([])
      )
      .and('should add to the new parent', ({ store }) =>
        expect(getSortedChildIdsOf(store, '_:c-2')).toEqual(['_:m-1'])
      );

    bdd
      .given('a store with conversations', () => createStoreWithConversations())
      .when('a child is part of 2 parents', ({ controller }) =>
        controller.edit(transaction => {
          upsertDatedMessage(transaction, '_:m-2', ['_:c-1', '_:c-2'], 2);
          upsertDatedMessage(transaction, '_:m-1', ['_:c-1'], 1);
          upsertDatedMessage(transaction, '_:m-3', ['_:c-2'], 3);
        })
      )
      .then('should appear in both parents', ({ store }) => {
        expect(getSortedChildIdsOf(store, '_:c-1')).toEqual(['_:m-1', '_:m-2']);
        expect(getSortedChildIdsOf(store, '_:c-2')).toEqual(['_:m-2', '_:m-3']);
      });

    bdd
      .given('a store with a child in a conversation', () => {
        const { controller, store } = createStoreWithConversations();

        controller.edit(transaction => upsertDatedMessage(transaction, '_:m-1', ['_:c-1'], 1));

        return { controller, parent: store.getSnapshot().get('_:c-1'), store };
      })
      .when('the child is updated without changing dateCreated and isPartOf', ({ controller }) =>
        controller.edit(transaction =>
          transaction.upsert('_:m-1', node => ({ ...node!, '@id': '_:m-1', text: ['Hello, World!'] }))
        )
      )
      .then('should not change the parent', ({ parent, store }) =>
        expect(store.getSnapshot().get('_:c-1')).toBe(parent)
      )
      .and('should return the updated child', ({ store }) =>
        expect(store.getSortedChildren(store.getSnapshot().get('_:c-1')!)[0]).toBe(store.getSnapshot().get('_:m-1'))
      );

    bdd
      .given('a store with a child in a conversation', () => {
        const { controller, store } = createStoreWithConversations();

        controller.edit(transaction => upsertDatedMessage(transaction, '_:m-1', ['_:c-1'], 1));

        return { controller, store };
      })
      .when('the parent is updated', ({ controller }) =>
        controller.edit(transaction =>
          transaction.upsert('_:c-1', node => ({ ...node!, '@id': '_:c-1', name: ['Conversation 1'] }))
        )
      )
      .then('should keep sorted children', ({ store }) =>
        expect(getSortedChildIdsOf(store, '_:c-1')).toEqual(['_:m-1'])
      );

    bdd
      .given('a store with a child in a conversation', () => {
        const { controller, store } = createStoreWithConversations();

        controller.edit(transaction => upsertDatedMessage(transaction, '_:m-1', ['_:c-1'], 1));

        return { controller, store };
      })
      .when('a transaction adding a child failed', ({ controller }) =>
        catchError(() =>
          controller.edit(transaction => {
            upsertDatedMessage(transaction, '_:m-0', ['_:c-1'], 0);

            throw new Error('Artificial');
          })
        )
      )
      .then('should keep sorted children', ({ store }) =>
        expect(getSortedChildIdsOf(store, '_:c-1')).toEqual(['_:m-1'])
      );

    bdd
      .given('a store with a child in a conversation', () => {
        const { controller, store } = createStoreWithConversations();

        controller.edit(transaction => upsertDatedMessage(transaction, '_:m-1', ['_:c-1'], 1));

        return { controller, store };
      })
      .when('the parent is deleted and re-created in same transaction', ({ controller }) =>
        controller.edit(transaction => {
          transaction.delete('_:c-1');
          transaction.upsert('_:c-1', () => ({ '@id': '_:c-1', '@type': new Set(['Conversation']) }));
          upsertDatedMessage(transaction, '_:m-2', ['_:c-1'], 2);
        })
      )
      .then('should only have the new child', ({ store }) =>
        expect(getSortedChildIdsOf(store, '_:c-1')).toEqual(['_:m-2'])
      );

    bdd
      .given('a store with a parent with children', () => {
        const { controller, store } = createStoreWithConversations();

        controller.edit(transaction => upsertDatedMessage(transaction, '_:m-1', ['_:c-1'], 1));

        return store;
      })
      .when('getSortedChildren() is called', store => store.getSortedChildren(store.getSnapshot().get('_:c-1')!))
      .then('should be an array', (_, children) => expect(Array.isArray(children)).toBe(true))
      .and('should be read-only', (_, children) => {
        expect(() => (children as Node[]).push(children[0]!)).toThrow(TypeError);
        expect(children).toHaveLength(1);
      });

    bdd
      .given('a store with conversations', () => createStoreWithConversations())
      .when('getSortedChildren() is called on a node without children', ({ store }) =>
        store.getSortedChildren(store.getSnapshot().get('_:c-1')!)
      )
      .then('should return an empty array', (_, children) => expect(children).toEqual([]));

    bdd
      .given('a store with conversations', () => createStoreWithConversations())
      .when('getSortedChildren() is called on a node not in the store', ({ store }) =>
        store.getSortedChildren({ '@id': '_:unknown', '@type': new Set(['Thing']) })
      )
      .then('should return an empty array', (_, children) => expect(children).toEqual([]));

    bdd
      .given('a store with conversations', () => createStoreWithConversations())
      .when('getSortedChildren() is called with invalid input', ({ store }) =>
        catchError(() => store.getSortedChildren({} as Node))
      )
      .then('should throw', (_, error) => expect(error).toBeTruthy());
  },
  NodeTest
);

scenario(
  'dateCreated',
  bdd => {
    for (const [name, dateCreated] of [
      ['a string', '2026-01-01'],
      ['a set of numbers', new Set([1])],
      ['Infinity', Infinity],
      ['NaN', NaN]
    ] satisfies [string, unknown][]) {
      bdd
        .given('a store with conversations', () => createStoreWithConversations())
        .when(`a node with dateCreated of ${name} is upserted`, ({ controller }) =>
          catchError(() =>
            controller.edit(transaction =>
              transaction.upsert(
                '_:m-1',
                () => ({ '@id': '_:m-1', '@type': new Set(['Message']), dateCreated }) as unknown as Node
              )
            )
          )
        )
        .then('should throw', (_, error) => expect(error).toBeTruthy())
        .and('should not add the node', ({ store }) => expect(store.getSnapshot().has('_:m-1')).toBe(false));
    }

    bdd
      .given('a store with conversations', () => createStoreWithConversations())
      .when('a node with dateCreated of a number is upserted', ({ controller }) =>
        controller.edit(transaction => upsertDatedMessage(transaction, '_:m-1', [], 1_700_000_000_000))
      )
      .then('should add the node', ({ store }) =>
        expect(store.getSnapshot().get('_:m-1')).toHaveProperty('dateCreated', 1_700_000_000_000)
      );
  },
  NodeTest
);
