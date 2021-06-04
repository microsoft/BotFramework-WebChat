import { Components } from '../../../packages/component';
import { createStore } from '../../../packages/core';

const { Composer } = Components;

function main() {
  const store = createStore({});

  return <Composer store={store} />;
}
