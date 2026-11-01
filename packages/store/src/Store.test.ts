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

function editWithAutoRelationship(
  controller: StoreTransactor,
  transactor: Parameters<StoreTransactor['edit']>[0]
): void {
  controller.edit(transactor, { autoRelationship: true });
}

function getPartIdsOf(store: Store, id: string, property: 'hasPart' | 'isPartOf'): string[] {
  const node = store.getSnapshot().get(id);

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

        editWithAutoRelationship(controller, transaction =>
          transaction.upsert('_:conversation', () => ({ '@id': '_:conversation', '@type': new Set(['Conversation']) }))
        );

        return { controller, store };
      })
      .when('a child node with isPartOf is upserted', ({ controller }) =>
        editWithAutoRelationship(controller, transaction =>
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

        editWithAutoRelationship(controller, transaction =>
          transaction.upsert('_:m-1', () => ({ '@id': '_:m-1', '@type': new Set(['Message']) }))
        );

        return { controller, store };
      })
      .when('a parent node with hasPart is upserted', ({ controller }) =>
        editWithAutoRelationship(controller, transaction =>
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
        editWithAutoRelationship(controller, transaction => {
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
      .then('should merge hasPart of the parent', ({ store }) =>
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-1', '_:m-2'])
      )
      .and('should add isPartOf to children', ({ store }) => {
        expect(getPartIdsOf(store, '_:m-1', 'isPartOf')).toEqual(['_:conversation']);
        expect(getPartIdsOf(store, '_:m-2', 'isPartOf')).toEqual(['_:conversation']);
      });

    bdd
      .given('an empty store', () => createStore())
      .when('nested parts are upserted', ({ controller }) =>
        editWithAutoRelationship(controller, transaction => {
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
        editWithAutoRelationship(controller, transaction =>
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
        editWithAutoRelationship(controller, transaction =>
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
        editWithAutoRelationship(controller, transaction => {
          transaction.upsert('_:conversation', node => ({ ...node!, hasPart: new Set([{ '@id': '_:m-2' }]) }));

          transaction.upsert('_:m-1', node => ({
            ...node!,
            isPartOf: new Set([{ '@id': '_:conversation' }]),
            text: ['Updated']
          }));
        })
      )
      .then('should remove the child as the child did not change its isPartOf', ({ store }) => {
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-2']);
        expect(store.getSnapshot().get('_:m-1')).not.toHaveProperty('isPartOf');
      });

    bdd
      .given('a store with a conversation and an orphan message', () => {
        const { controller, store } = createStore();

        editWithAutoRelationship(controller, transaction => {
          transaction.upsert('_:conversation', () => ({ '@id': '_:conversation', '@type': new Set(['Conversation']) }));
          transaction.upsert('_:m-1', () => ({ '@id': '_:m-1', '@type': new Set(['Message']) }));
        });

        return { controller, store };
      })
      .when('the child adds isPartOf while the parent removes hasPart in the same transaction', ({ controller }) =>
        editWithAutoRelationship(controller, transaction => {
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
        editWithAutoRelationship(controller, transaction => transaction.delete('_:conversation'))
      )
      .then('should remove isPartOf from all children', ({ store }) => {
        expect(store.getSnapshot().get('_:m-1')).not.toHaveProperty('isPartOf');
        expect(store.getSnapshot().get('_:m-2')).not.toHaveProperty('isPartOf');
      });

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a child is deleted', ({ controller }) =>
        editWithAutoRelationship(controller, transaction => transaction.delete('_:m-1'))
      )
      .then('should remove the child from hasPart of the parent', ({ store }) =>
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-2'])
      );

    bdd
      .given('a store with nested parts', () => {
        const { controller, store } = createStore();

        editWithAutoRelationship(controller, transaction => {
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
        editWithAutoRelationship(controller, transaction => transaction.delete('_:thread'))
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
        editWithAutoRelationship(controller, transaction => {
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

        editWithAutoRelationship(controller, transaction =>
          transaction.upsert('_:m-1', node => ({ ...node!, position: 1 }))
        );

        return { controller, snapshot: store.getSnapshot(), store };
      })
      .when('another member of the same part is upserted with the same position', ({ controller }) =>
        catchError(() =>
          editWithAutoRelationship(controller, transaction =>
            transaction.upsert('_:m-2', node => ({ ...node!, position: 1 }))
          )
        )
      )
      .then('should throw', (_, error) => expect(error).toEqual(expect.any(Error)))
      .and('should not change the snapshot', ({ snapshot, store }) => expect(store.getSnapshot()).toBe(snapshot));

    bdd
      .given('a store with a conversation with a positioned member', () => {
        const { controller, store } = createStoreWithNodes();

        editWithAutoRelationship(controller, transaction =>
          transaction.upsert('_:m-1', node => ({ ...node!, position: 1 }))
        );

        return { controller, snapshot: store.getSnapshot(), store };
      })
      .when('a new member with the same position joins the part via hasPart of the parent', ({ controller }) =>
        catchError(() =>
          editWithAutoRelationship(controller, transaction => {
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
        editWithAutoRelationship(controller, transaction => {
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

        editWithAutoRelationship(controller, transaction => {
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
        editWithAutoRelationship(controller, transaction =>
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
  },
  NodeTest
);

scenario(
  'without autoRelationship',
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
        catchError(() =>
          controller.edit(transaction =>
            transaction.upsert('_:m-1', () => ({
              '@id': '_:m-1',
              '@type': new Set(['Message']),
              isPartOf: new Set([{ '@id': '_:conversation' }])
            }))
          )
        )
      )
      .then('should throw for inverse relationship', (_, error) =>
        expect(error).toHaveProperty('message', expect.stringContaining('inverse'))
      )
      .and('should not change the snapshot', ({ snapshot, store }) => expect(store.getSnapshot()).toBe(snapshot));

    bdd
      .given('a store with a message', () => {
        const { controller, store } = createStore();

        controller.edit(transaction =>
          transaction.upsert('_:m-1', () => ({ '@id': '_:m-1', '@type': new Set(['Message']) }))
        );

        return { controller, snapshot: store.getSnapshot(), store };
      })
      .when('a parent node with hasPart only is upserted with autoRelationship of false', ({ controller }) =>
        catchError(() =>
          controller.edit(
            transaction =>
              transaction.upsert('_:conversation', () => ({
                '@id': '_:conversation',
                '@type': new Set(['Conversation']),
                hasPart: new Set([{ '@id': '_:m-1' }])
              })),
            { autoRelationship: false }
          )
        )
      )
      .then('should throw for inverse relationship', (_, error) =>
        expect(error).toHaveProperty('message', expect.stringContaining('inverse'))
      )
      .and('should not change the snapshot', ({ snapshot, store }) => expect(store.getSnapshot()).toBe(snapshot));

    bdd
      .given('an empty store', () => createStore())
      .when('parent and child are upserted with both sides declared', ({ controller }) =>
        controller.edit(transaction => {
          transaction.upsert('_:conversation', () => ({
            '@id': '_:conversation',
            '@type': new Set(['Conversation']),
            hasPart: new Set([{ '@id': '_:m-1' }])
          }));

          transaction.upsert('_:m-1', () => ({
            '@id': '_:m-1',
            '@type': new Set(['Message']),
            isPartOf: new Set([{ '@id': '_:conversation' }])
          }));
        })
      )
      .then('should add both nodes', ({ store }) => {
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-1']);
        expect(getPartIdsOf(store, '_:m-1', 'isPartOf')).toEqual(['_:conversation']);
      });

    bdd
      .given('a store with cross-referencing nodes', () => {
        const { controller, store } = createStoreWithNodes();

        return { controller, snapshot: store.getSnapshot(), store };
      })
      .when('a parent removes a child from hasPart without updating the child', ({ controller }) =>
        catchError(() =>
          controller.edit(transaction =>
            transaction.upsert('_:conversation', node => ({ ...node!, hasPart: new Set([{ '@id': '_:m-2' }]) }))
          )
        )
      )
      .then('should throw for inverse relationship', (_, error) =>
        expect(error).toHaveProperty('message', expect.stringContaining('inverse'))
      )
      .and('should not change the snapshot', ({ snapshot, store }) => expect(store.getSnapshot()).toBe(snapshot));

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a parent removes a child and the child removes the parent', ({ controller }) =>
        controller.edit(transaction => {
          transaction.upsert('_:conversation', node => ({ ...node!, hasPart: new Set([{ '@id': '_:m-2' }]) }));
          transaction.upsert('_:m-1', node => {
            const { isPartOf: _, ...rest } = node!;

            return rest;
          });
        })
      )
      .then('should remove the relationship', ({ store }) => {
        expect(getPartIdsOf(store, '_:conversation', 'hasPart')).toEqual(['_:m-2']);
        expect(store.getSnapshot().get('_:m-1')).not.toHaveProperty('isPartOf');
      });

    bdd
      .given('a store with cross-referencing nodes', () => createStoreWithNodes())
      .when('a node is deleted', ({ controller }) => controller.edit(transaction => transaction.delete('_:m-1')))
      .then('should keep part membership consistent', ({ store }) =>
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
      .when('edit is called with an invalid init', ({ controller }) =>
        catchError(() =>
          controller.edit(
            transaction => transaction.upsert('_:m-1', () => ({ '@id': '_:m-1', '@type': new Set(['Message']) })),
            { autoRelationship: 'yes' } as unknown as { autoRelationship: boolean }
          )
        )
      )
      .then('should throw', (_, error) => expect(error).toEqual(expect.any(Error)))
      .and('should not add the node', ({ store }) => expect(store.getSnapshot().size).toBe(0));
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
      .when('a child is upserted with autoRelationship', ({ controller }) =>
        editWithAutoRelationship(controller, transaction =>
          transaction.upsert('_:m-1', () => ({
            '@id': '_:m-1',
            '@type': new Set(['Message']),
            isPartOf: new Set([{ '@id': '_:conversation' }])
          }))
        )
      )
      .then('should include the auto-fixed parent', ({ calls }) =>
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
