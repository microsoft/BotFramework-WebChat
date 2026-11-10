import DirectLineJSStore, { type DirectLineJSStoreInit } from './DirectLineJSStore.ts';

function createDirectLineJSStore(init: DirectLineJSStoreInit): DirectLineJSStore {
  return new DirectLineJSStore(init);
}

export default createDirectLineJSStore;
export { type DirectLineJSStoreInit };
