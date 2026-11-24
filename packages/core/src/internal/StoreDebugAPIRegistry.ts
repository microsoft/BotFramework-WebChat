import type { EngineStore } from '../engine/createEngineStore';
import type { StoreDebugAPI } from '../types/StoreDebugAPI';

export default new WeakMap<EngineStore, StoreDebugAPI>();
