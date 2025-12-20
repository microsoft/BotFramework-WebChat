import NativeAPIBreakpoint, { BREAKPOINT_NAMES } from './NativeAPIBreakpoint';
import type { NativeAPIBreakpointDebugContext } from './NativeAPIBreakpointDebugContext';
import NativeAPIEventTarget from './NativeAPIEventTarget';

declare const process: {
  env: {
    NODE_ENV?: string | undefined;
  };
};

const SHOULD_LOCKDOWN = process.env.NODE_ENV === 'production';

interface NativeAPI {
  get breakpoint(): NativeAPIBreakpoint;
  get debugger(): void;
  get eventTarget(): NativeAPIEventTarget;
}

class InternalNativeAPI implements NativeAPI {
  constructor() {
    this.UNSAFE_callBreakpoint = {} as NativeAPIBreakpoint;

    for (const name of BREAKPOINT_NAMES) {
      // Must be from one of our hardcoded strings.
      // eslint-disable-next-line security/detect-object-injection
      this.UNSAFE_callBreakpoint[name] = SHOULD_LOCKDOWN
        ? // eslint-disable-next-line security/detect-object-injection
          this.#breakpoint[name].bind(this, this.#breakpointDebugContext)
        : () => {
            // eslint-disable-next-line security/detect-object-injection
            this.#breakpoint[name](this.#breakpointDebugContext);
          };
    }
  }

  #breakpoint: NativeAPIBreakpoint = new NativeAPIBreakpoint();
  #breakpointDebugContext: NativeAPIBreakpointDebugContext = { activities: Object.freeze([]) };
  #eventTarget: NativeAPIEventTarget = new NativeAPIEventTarget();

  get breakpoint(): NativeAPIBreakpoint {
    return this.#breakpoint;
  }

  get debugger() {
    const __DEBUG_CONTEXT__ = this.#breakpointDebugContext;

    // eslint-disable-next-line no-debugger
    debugger;

    return undefined;
  }

  get eventTarget(): NativeAPIEventTarget {
    return this.#eventTarget;
  }

  toNativeAPI = (): NativeAPI => {
    const breakpoint = this.#breakpoint;
    const eventTarget = this.#eventTarget;

    return Object.freeze(
      Object.defineProperty(
        {
          get breakpoint() {
            return breakpoint;
          },
          get eventTarget() {
            return eventTarget;
          }
        } satisfies Omit<NativeAPI, 'debugger'> as NativeAPI,
        'debugger',
        {
          configurable: false,
          get: () => this.debugger
        }
      )
    );
  };

  UNSAFE_callBreakpoint: NativeAPIBreakpoint;

  UNSAFE_extendsDebugContext(name: keyof NativeAPIBreakpointDebugContext, getter: () => any) {
    Object.defineProperty(this.#breakpointDebugContext, name, {
      configurable: true,
      get() {
        return getter();
      }
    });
  }
}

export default InternalNativeAPI;
export { NativeAPI };
