import { RestrictedDebugAPI, type InferPublic } from '@msinternal/botframework-webchat-core-debug-api';
import type { ArrayElement } from 'type-fest';

const BREAKPOINT_NAMES = ['incomingActivity'] as const;

type StoreBreakpointName = ArrayElement<typeof BREAKPOINT_NAMES>;

type StoreDebugContext = {
  readonly activities: readonly any[];
};

class RestrictedStoreDebugAPI extends RestrictedDebugAPI<StoreBreakpointName, StoreDebugContext> {
  constructor(getActivities: () => StoreDebugContext['activities']) {
    super(
      BREAKPOINT_NAMES,
      Object.freeze({
        activities: getActivities
      })
    );
  }
}

type StoreDebugAPI = InferPublic<RestrictedStoreDebugAPI>;

export { RestrictedStoreDebugAPI, type StoreDebugAPI };
