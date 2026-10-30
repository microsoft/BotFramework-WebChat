import Store, { type StoreTransaction } from '../Store.ts';

type TestStore = {
  readonly edit: (transactor: (transaction: StoreTransaction) => void) => void;
  readonly store: Store;
};

/**
 * Creates a store with a source that lets the test edit the graph directly.
 */
export default function createTestStore(): TestStore {
  let edit: TestStore['edit'] | undefined;

  const store = new Store({
    start(controller) {
      edit = transactor => controller.edit(transactor);
    }
  });

  if (!edit) {
    throw new Error('Store did not start the source synchronously');
  }

  return Object.freeze({ edit, store });
}

export type { TestStore };
