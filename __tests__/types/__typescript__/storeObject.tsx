import ReactWebChat from '../../../packages/bundle/lib/index';
import createStore from '../../../packages/core/lib/createStore';

function main() {
  const store = createStore({});

  return <ReactWebChat store={store} />;
}
