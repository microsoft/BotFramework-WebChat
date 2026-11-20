import Store from '../Store.ts';

type DirectLineJSStoreInit = {
  token: string;
};

function createDirectLineStore(_init: DirectLineJSStoreInit): Store {
  return new Store({
    start(controller) {
      controller.edit(transaction => {
        transaction.upsert('_:a-00001', () => ({
          '@id': '_:a-00001',
          '@type': new Set(['Message']),
          text: ['Hello, World!']
        }));
      });
    }
  });
}

export default createDirectLineStore;
export { type DirectLineJSStoreInit };
