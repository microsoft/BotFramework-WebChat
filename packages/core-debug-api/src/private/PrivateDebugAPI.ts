import type { BaseContextGetters, BreakpointObject, ContextOfGetters, PrivateDebugAPIType } from '../types';
import { SHOULD_LOCKDOWN } from './constants';
import DebugAPI from './DebugAPI';

// 🔒 This function must be left empty.
// eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
const BREAKPOINT_FUNCTION = <T>(__DEBUG_CONTEXT__: T) => {};

class PrivateDebugAPI<
  TBreakpointName extends string,
  TContextGetters extends BaseContextGetters
> implements PrivateDebugAPIType<TBreakpointName, TContextGetters> {
  constructor(breakpointNames: readonly TBreakpointName[], contextGetters: TContextGetters) {
    type TContext = { [K in keyof TContextGetters]: ReturnType<TContextGetters[K]> };

    this.#context = Object.create(null) satisfies Partial<TContext> as TContext;

    for (const [name, getter] of Object.entries(contextGetters)) {
      Object.defineProperty(this.#context, name, {
        configurable: false,
        enumerable: true,
        get() {
          return getter();
        }
      });
    }

    const breakpoint = Object.create(null) as Record<
      TBreakpointName,
      (__DEBUG_CONTEXT__: TContext, ...args: any[]) => void
    >;
    const UNSAFE_callBreakpoint = Object.create(null) as Record<TBreakpointName, (...args: any[]) => void>;

    // Design of lockdown:
    // - Modifying `this.breakpoint` object will not trick our `this.UNSAFE_callBreakpoint()` to trigger the new code path
    // - No JS code should know if a function is being called or not, except the engine/debugger
    // - Thus, breakpoint functions cannot be spied from another JS code

    // 🔒 We must make sure JS code cannot intercept the call to any breakpoint functions.

    // TODO: [P1] Lockdown cannot be tested automatically. Any code changed below must be tested manually.
    //       How to test manually: set `SHOULD_LOCKDOWN = true`, run the same test, it should fail with:
    //       "Cannot assign to read only property 'incomingActivity' of object '#<Object>'"
    for (const name of breakpointNames) {
      // breakpoint is created by Object.create(null).
      // eslint-disable-next-line security/detect-object-injection
      breakpoint[name] = BREAKPOINT_FUNCTION.bind(this);

      // UNSAFE_callBreakpoint is created by Object.create(null).
      // eslint-disable-next-line security/detect-object-injection
      UNSAFE_callBreakpoint[name] = SHOULD_LOCKDOWN
        ? // breakpoint is created by Object.create(null).
          // eslint-disable-next-line security/detect-object-injection
          breakpoint[name].bind(this, { ...this.#context })
        : (...args: any[]) =>
            // breakpoint is created by Object.create(null).
            // eslint-disable-next-line security/detect-object-injection
            breakpoint[name]({ ...this.#context }, ...args);
    }

    this.#breakpoint = breakpoint;
    this.UNSAFE_callBreakpoint = Object.freeze(UNSAFE_callBreakpoint);

    if (SHOULD_LOCKDOWN) {
      Object.freeze(breakpoint);
      Object.freeze(this);
    }
  }

  #breakpoint: BreakpointObject<TBreakpointName, ContextOfGetters<TContextGetters>>;
  #context: ContextOfGetters<TContextGetters>;

  toPublic() {
    return new DebugAPI(this.#breakpoint, this.#context);
  }

  UNSAFE_callBreakpoint: Readonly<Record<TBreakpointName, (...args: any[]) => void>>;
}

export default PrivateDebugAPI;
