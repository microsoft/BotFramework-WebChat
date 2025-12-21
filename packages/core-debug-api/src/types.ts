type BaseContextGetters = { readonly [key: string]: () => unknown };
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
 * 🔒 This object must not be passed outside for external consumption.
 */
interface PrivateDebugAPIType<TBreakpointName extends string, TContextGetters extends BaseContextGetters> {
  /**
   * Creates a public version of Debug API for external consumption.
   */
  toPublic(): DebugAPIType<TBreakpointName, ContextOfGetters<TContextGetters>>;

  /**
   * Triggers a breakpoint function.
   */
  get UNSAFE_callBreakpoint(): Readonly<Record<TBreakpointName, (...args: any[]) => void>>;

  get '~types'(): {
    breakpointName: TBreakpointName;
    context: ContextOfGetters<TContextGetters>;
    public: DebugAPIType<TBreakpointName, ContextOfGetters<TContextGetters>>;
  };
}

type InferBreakpointName<T extends PrivateDebugAPIType<any, any>> = T['~types']['breakpointName'];
type InferContext<T extends PrivateDebugAPIType<any, any>> = T['~types']['context'];
type InferPublic<T extends PrivateDebugAPIType<any, any>> = T['~types']['public'];

export type {
  BaseContextGetters,
  BreakpointObject,
  ContextOfGetters,
  DebugAPIType,
  InferBreakpointName,
  InferContext,
  InferPublic,
  PrivateDebugAPIType
};
