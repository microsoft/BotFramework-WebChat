import assert from 'node:assert';
import { mock, type Mock } from 'node:test';
import { Store, type StoreController, type StoreListener } from '../index.ts';

function createStoreAndController(): {
  readonly controller: StoreController;
  readonly onUpdate: Mock<StoreListener>;
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
