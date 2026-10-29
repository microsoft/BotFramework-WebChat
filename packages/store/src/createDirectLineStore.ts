import Store from './Store';

type DirectLineStoreInit = {
  token: string;
};

function createDirectLineStore(_init: DirectLineStoreInit): Store {
  return new Store({
    start(controller) {
      controller.upsertNode({
        '@id': 'a-00001',
        '@type': new Set(['Message']),
        text: 'Hello, World!'
      });
    }
  });
}

export default createDirectLineStore;
