import PrivateDebugAPI from './private/PrivateDebugAPI';

export default function createPrivateDebugAPI<TBreakpointName extends string, TContext extends object>(
  breakpointNames: readonly TBreakpointName[]
) {
  return new PrivateDebugAPI<TBreakpointName, TContext>(breakpointNames);
}
