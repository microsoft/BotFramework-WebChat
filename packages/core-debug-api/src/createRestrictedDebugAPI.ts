import RestrictedDebugAPI from './private/RestrictedDebugAPI';

export default function createRestrictedDebugAPI<
  const TBreakpointName extends string,
  const TContextGetters extends { readonly [key: string]: typeof key extends '@' ? never : () => unknown }
>(breakpointNames: readonly TBreakpointName[], contextGetters: TContextGetters) {
  return new RestrictedDebugAPI<TBreakpointName, TContextGetters>(breakpointNames, contextGetters);
}
