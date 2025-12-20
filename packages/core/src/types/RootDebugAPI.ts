import { type PrivateDebugAPI } from '@msinternal/botframework-webchat-core-debug-api';

type RootDebugBreakpointName = 'incomingActivity';

type RootDebugContext = {
  readonly activities: readonly any[];
};

type RootPrivateDebugAPI = PrivateDebugAPI<RootDebugBreakpointName, RootDebugContext>;

// TODO: [P1] Not sure why it break "api" packages. "api" tries to reference the "core-debug-api" package and failed.
//       Maybe types are not rolled up in "core" packages properly.
// type RootDebugAPI = InferPublic<RootPrivateDebugAPI>;

type RootDebugAPI = {
  get breakpoint(): Readonly<Record<RootDebugBreakpointName, (__DEBUG_CONTEXT__: RootDebugContext) => void>>;
  get debugger(): void;
};

export { type RootDebugAPI, type RootPrivateDebugAPI };
