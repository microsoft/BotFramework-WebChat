import ReactWebChat from '../../../packages/bundle';
import { createStore } from '../../../packages/core';

function main() {
  const store = createStore({});

  return <ReactWebChat store={store} />;
}
