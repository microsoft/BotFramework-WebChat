import type createStore from '../createStore';
import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';

/** The ponyfill each store was created with: `<Composer>` checks that it matches the ponyfill of its props. */
export default new WeakMap<ReturnType<typeof createStore>, GlobalScopePonyfill>();
