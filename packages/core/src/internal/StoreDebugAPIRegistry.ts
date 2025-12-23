import type createStore from '../createStore';
import type { StoreDebugAPI } from '../types/StoreDebugAPI';

export default new WeakMap<ReturnType<typeof createStore>, StoreDebugAPI>();
