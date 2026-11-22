import assert from 'node:assert';
import { type StoreController, type StoreListener, Store } from '../index.ts';
import { mock } from 'node:test';

function createStoreAndController(): {
  readonly controller: StoreController;
  readonly onUpdate: StoreListener;
  readonly store: Store;
} {
  let controller: StoreController | undefined;
  const store = new Store({
    start(c) {
      controller = c;
    }
  });

  assert(controller);

  const onUpdate = mock.fn<StoreListener>();

  store.subscribe(onUpdate);

  return Object.freeze({ controller: controller as StoreController, onUpdate, store });
}

export default createStoreAndController;
