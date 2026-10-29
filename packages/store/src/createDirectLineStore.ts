import Store from './Store.ts';

type DirectLineStoreInit = {
  token: string;
};

function createDirectLineStore(_init: DirectLineStoreInit): Store {
  return new Store({
    start(controller) {
      controller.edit(transaction => {
        transaction.upsertNode({
          '@id': '_:a-00001',
          '@type': new Set(['Message']),
          text: ['Hello, World!']
        });
      });
    }
  });
}

export default createDirectLineStore;
