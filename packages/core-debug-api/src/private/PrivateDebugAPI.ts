import type { BreakpointObject, DebugAPI, PrivateDebugAPI as PrivateDebugAPIType } from '../types';
import { SHOULD_LOCKDOWN } from './constants';

// 🔒 This function must be left empty.
// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
const BREAKPOINT_FUNCTION = <T>(__DEBUG_CONTEXT__: T) => {};

class PrivateDebugAPI<TBreakpointName extends string, TContext extends object> implements PrivateDebugAPIType<
  TBreakpointName,
  TContext
> {
  constructor(breakpointNames: readonly TBreakpointName[]) {
    this.#breakpointDebugContext = {} satisfies Partial<TContext> as TContext;
    this.UNSAFE_callBreakpoint = {} as typeof this.UNSAFE_callBreakpoint;

    const breakpoint = {} as Record<TBreakpointName, (__DEBUG_CONTEXT__: TContext) => void>;
    const UNSAFE_callBreakpoint = {} as Record<TBreakpointName, () => void>;

    // Design of lockdown:
    // - Modifying `this.breakpoint` object will not trick our `this.UNSAFE_callBreakpoint()` to trigger the new code path
    // - No JS code should know if a function is being called or not, except the engine/debugger
    // - Thus, breakpoint functions cannot be spied from another JS code

    // 🔒 We must make sure JS code cannot intercept the call to any breakpoint functions.

    // TODO: [P1] Lockdown cannot be tested automatically. Any code changed below must be tested manually.
    //       How to test manually: run `NODE_ENV=production npm run build`, run the same test, it should fail.
    for (const name of breakpointNames) {
      // eslint-disable-next-line security/detect-object-injection
      breakpoint[name] = BREAKPOINT_FUNCTION;

      // Must be from one of our hardcoded strings.
      // eslint-disable-next-line security/detect-object-injection
      UNSAFE_callBreakpoint[name] = SHOULD_LOCKDOWN
        ? // eslint-disable-next-line security/detect-object-injection
          breakpoint[name].bind(this, Object.freeze({ ...this.#breakpointDebugContext }))
        : () =>
            // eslint-disable-next-line security/detect-object-injection
            breakpoint[name](Object.freeze({ ...this.#breakpointDebugContext }));
    }

    SHOULD_LOCKDOWN && Object.freeze(breakpoint);
    Object.freeze(UNSAFE_callBreakpoint);

    this.#breakpoint = breakpoint;
    this.UNSAFE_callBreakpoint = UNSAFE_callBreakpoint;
  }

  #breakpoint: BreakpointObject<TBreakpointName, TContext>;
  #breakpointDebugContext: TContext;

  toPublic(): DebugAPI<TBreakpointName, TContext> {
    const breakpoint = this.#breakpoint;
    const getDebugger = () => {
      const __DEBUG_CONTEXT__ = this.#breakpointDebugContext;

      // eslint-disable-next-line no-debugger
      debugger;

      return undefined;
    };

    return Object.freeze({
      // 🔒 We must make sure JS code cannot intercept the call to any breakpoint functions.
      get breakpoint() {
        return breakpoint;
      },
      // 🔒 We must make sure JS code cannot intercept the call to debugger getter.
      // TODO: [P1] We need manual testing for "debugger" syntax.
      get debugger() {
        return getDebugger();
      }
    });
  }

  UNSAFE_callBreakpoint: Readonly<Record<TBreakpointName, () => void>>;

  // TODO: [P*] Fold this back to constructor.
  UNSAFE_extendsDebugContextOnce(name: keyof TContext, getter: () => TContext[typeof name]) {
    Object.defineProperty(this.#breakpointDebugContext, name, {
      configurable: false,
      enumerable: true,
      get() {
        return getter();
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this
  get '~types'() {
    return Object.freeze({ public: undefined }) as any;
  }
}

export default PrivateDebugAPI;
export { DebugAPI as NativeAPI };
