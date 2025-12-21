import PrivateDebugAPI from './private/PrivateDebugAPI';

export default function createPrivateDebugAPI<
  const TBreakpointName extends string,
  const TContextGetters extends { readonly [key: string]: typeof key extends '@' ? never : () => unknown }
>(breakpointNames: readonly TBreakpointName[], contextGetters: TContextGetters) {
  return new PrivateDebugAPI<TBreakpointName, TContextGetters>(breakpointNames, contextGetters);
}
