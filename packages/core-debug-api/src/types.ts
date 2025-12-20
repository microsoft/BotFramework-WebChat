type BreakpointObject<TName extends string, TContext extends object> = Readonly<
  Record<TName, (__DEBUG_CONTEXT__: TContext) => void>
>;

interface DebugAPI<TBreakpointName extends string, TContext extends object> {
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
interface PrivateDebugAPI<TBreakpointName extends string, TContext extends object> {
  /**
   * Creates a public version of Debug API for external consumption.
   */
  toPublic(): DebugAPI<TBreakpointName, TContext>;

  /**
   * Triggers a breakpoint function.
   */
  get UNSAFE_callBreakpoint(): Readonly<Record<TBreakpointName, () => void>>;

  /**
   * Extends debug context with new getter property.
   */
  UNSAFE_extendsDebugContextOnce(name: keyof TContext, getter: () => TContext[typeof name]): void;

  get '~types'(): {
    breakpointName: TBreakpointName;
    context: TContext;
    public: DebugAPI<TBreakpointName, TContext>;
  };
}

type InferBreakpointName<T extends PrivateDebugAPI<any, any>> = T['~types']['breakpointName'];
type InferContext<T extends PrivateDebugAPI<any, any>> = T['~types']['context'];
type InferPublic<T extends PrivateDebugAPI<any, any>> = T['~types']['public'];

export type { BreakpointObject, DebugAPI, InferBreakpointName, InferContext, InferPublic, PrivateDebugAPI };
