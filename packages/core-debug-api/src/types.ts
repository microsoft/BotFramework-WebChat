type BaseContextGetters = { readonly [key: string]: () => unknown };
type BaseContext = { readonly [key: string]: unknown };
type ContextOfGetters<T extends BaseContextGetters> = { [K in keyof T]: ReturnType<T[K]> };

type BreakpointObject<TName extends string, TContext extends object> = Readonly<
  Record<TName, (__DEBUG_CONTEXT__: TContext, ...args: any[]) => void>
>;

interface DebugAPIType<TBreakpointName extends string, TContext extends object> {
  /**
   * 🚨 This is strictly for debugging only.
   *
   * List of execution points for debugger to break into.
   *
   * Type `debug($0.webChat.breakpoint.functionName)` in DevTools to break into specific execution.
   */
  get breakpoint(): BreakpointObject<TBreakpointName, TContext>;

  /**
   * 🚨 This is strictly for debugging only.
   *
   * Break into debugger immediately.
   *
   * Note: if Content Security Policy is enabled, it may not break into debugger.
   */
  get debugger(): void;
}

/**
 * This is the triggering side of the debugging API.
 *
 * This object should be kept inside the code that need to be debugged.
 *
 * For public consumption, call `toPublic()` to create an object for receiving side.
 */
interface RestrictedDebugAPIType<TBreakpointName extends string, TContext extends BaseContext> {
  /**
   * Creates a public version of Debug API for external consumption.
   */
  toPublic(): DebugAPIType<TBreakpointName, TContext>;

  /**
   * Triggers a breakpoint function.
   */
  get UNSAFE_callBreakpoint(): Readonly<Record<TBreakpointName, (...args: any[]) => void>>;

  readonly '~types': {
    readonly public: DebugAPIType<TBreakpointName, TContext>;
  };
}

type InferPublic<T extends RestrictedDebugAPIType<any, any>> = T['~types']['public'];

export type {
  BaseContext,
  BaseContextGetters,
  BreakpointObject,
  ContextOfGetters,
  DebugAPIType,
  InferPublic,
  RestrictedDebugAPIType
};
