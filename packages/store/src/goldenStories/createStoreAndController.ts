import assert from 'node:assert';
import { type StoreController, Store } from '../index.ts';

function createStoreAndController(): {
  readonly controller: StoreController;
  readonly store: Store;
} {
  let controller: StoreController | undefined;
  const store = new Store({
    start(c) {
      controller = c;
    }
  });

  assert(controller);

  return Object.freeze({ controller: controller as StoreController, store });
}

export default createStoreAndController;
