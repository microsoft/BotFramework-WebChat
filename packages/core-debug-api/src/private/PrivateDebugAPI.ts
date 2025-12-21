import type {
  BaseContextGetters,
  BreakpointObject,
  ContextOfGetters,
  DebugAPI,
  PrivateDebugAPI as PrivateDebugAPIType
} from '../types';
import { SHOULD_LOCKDOWN } from './constants';

// 🔒 This function must be left empty.
// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
const BREAKPOINT_FUNCTION = <T>(__DEBUG_CONTEXT__: T) => {};

class PrivateDebugAPI<
  TBreakpointName extends string,
  TContextGetters extends BaseContextGetters
> implements PrivateDebugAPIType<TBreakpointName, TContextGetters> {
  constructor(breakpointNames: readonly TBreakpointName[], contextGetters: TContextGetters) {
    type TContext = { [K in keyof TContextGetters]: ReturnType<TContextGetters[K]> };

    this.#breakpointDebugContext = {} satisfies Partial<TContext> as TContext;

    for (const [name, getter] of Object.entries(contextGetters)) {
      Object.defineProperty(this.#breakpointDebugContext, name, {
        configurable: false,
        enumerable: true,
        get() {
          return getter();
        }
      });
    }

    this.UNSAFE_callBreakpoint = {} as typeof this.UNSAFE_callBreakpoint;

    const breakpoint = {} as Record<TBreakpointName, (__DEBUG_CONTEXT__: TContext, ...args: any[]) => void>;
    const UNSAFE_callBreakpoint = {} as Record<TBreakpointName, (...args: any[]) => void>;

    // Design of lockdown:
    // - Modifying `this.breakpoint` object will not trick our `this.UNSAFE_callBreakpoint()` to trigger the new code path
    // - No JS code should know if a function is being called or not, except the engine/debugger
    // - Thus, breakpoint functions cannot be spied from another JS code

    // 🔒 We must make sure JS code cannot intercept the call to any breakpoint functions.

    // TODO: [P1] Lockdown cannot be tested automatically. Any code changed below must be tested manually.
    //       How to test manually: set `SHOULD_LOCKDOWN = true`, run the same test, it should fail.
    for (const name of breakpointNames) {
      // eslint-disable-next-line security/detect-object-injection
      breakpoint[name] = BREAKPOINT_FUNCTION;

      // Must be from one of our hardcoded strings.
      // eslint-disable-next-line security/detect-object-injection
      UNSAFE_callBreakpoint[name] = SHOULD_LOCKDOWN
        ? // eslint-disable-next-line security/detect-object-injection
          breakpoint[name].bind(this, { ...this.#breakpointDebugContext })
        : (...args: any[]) =>
            // eslint-disable-next-line security/detect-object-injection
            breakpoint[name]({ ...this.#breakpointDebugContext }, ...args);
    }

    SHOULD_LOCKDOWN && Object.freeze(breakpoint);

    this.#breakpoint = breakpoint;
    this.UNSAFE_callBreakpoint = Object.freeze(UNSAFE_callBreakpoint);
  }

  #breakpoint: BreakpointObject<TBreakpointName, ContextOfGetters<TContextGetters>>;
  #breakpointDebugContext: ContextOfGetters<TContextGetters>;

  toPublic(): DebugAPI<TBreakpointName, ContextOfGetters<TContextGetters>> {
    const breakpoint = this.#breakpoint;
    const getDebugger = () => {
      // @ts-expect-error Unused variable for debugging.
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

  UNSAFE_callBreakpoint: Readonly<Record<TBreakpointName, (...args: any[]) => void>>;

  // eslint-disable-next-line class-methods-use-this
  get '~types'() {
    return Object.freeze({ public: undefined }) as any;
  }
}

export default PrivateDebugAPI;
export { DebugAPI as NativeAPI };
