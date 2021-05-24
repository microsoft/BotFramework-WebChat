import Composer from '../../../packages/component/lib/Composer';
import createStore from '../../../packages/core/lib/createStore';

function main() {
  const store = createStore({});

  return <Composer store={store} />;
}
