import { RestrictedDebugAPI, type InferPublic } from '@msinternal/botframework-webchat-core-debug-api';
import type { ArrayElement } from 'type-fest';

const BREAKPOINT_NAMES = ['incomingActivity'] as const;

type RootBreakpointName = ArrayElement<typeof BREAKPOINT_NAMES>;

type RootDebugContext = {
  readonly activities: readonly any[];
};

class RestrictedRootDebugAPI extends RestrictedDebugAPI<RootBreakpointName, RootDebugContext> {
  constructor(getActivities: () => RootDebugContext['activities']) {
    super(
      BREAKPOINT_NAMES,
      Object.freeze({
        activities: getActivities
      })
    );
  }
}

// TODO: [P1] Not sure why it break "api" packages. "api" tries to reference the "core-debug-api" package and failed.
//       Maybe types are not rolled up in "core" packages properly.
type RootDebugAPI = InferPublic<RestrictedRootDebugAPI>;

// type RootDebugAPI = {
//   get breakpoint(): Readonly<Record<RootBreakpointName, (__DEBUG_CONTEXT__: RootDebugContext) => void>>;
//   get debugger(): void;
// };

export { RestrictedRootDebugAPI, type RootDebugAPI };
