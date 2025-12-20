/* eslint-disable max-classes-per-file */
import type { ArrayElement } from 'type-fest';

declare const process: {
  env: {
    NODE_ENV?: string | undefined;
  };
};

const SHOULD_LOCKDOWN = process.env.NODE_ENV === 'production';

type Activity = any;

type NativeAPIDebugContext = {
  readonly activities: readonly Activity[];
};

const BREAKPOINT_NAMES = Object.freeze(['activitiesChange', 'incomingActivity'] as const);

// #region Types assertion
let ACTUAL_BREAKPOINT_NAMES: keyof NativeAPIBreakpoint;

ACTUAL_BREAKPOINT_NAMES satisfies ArrayElement<typeof BREAKPOINT_NAMES>;
BREAKPOINT_NAMES.at(0) satisfies typeof ACTUAL_BREAKPOINT_NAMES;
// #endregion

/* eslint-disable class-methods-use-this, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
class NativeAPIBreakpoint {
  /**
   * Will be called whenever activities has changed.
   *
   * This includes both incoming and outgoing activities.
   */
  activitiesChange(__DEBUG_CONTEXT__?: NativeAPIDebugContext) {}

  /** Will be called when an incoming activity is received. */
  incomingActivity(__DEBUG_CONTEXT__?: NativeAPIDebugContext) {}
}
/* eslint-enable class-methods-use-this, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

class IncomingActivityEvent extends CustomEvent<Activity> {
  // eslint-disable-next-line no-useless-constructor
  constructor(type: 'incomingactivity', eventInitDict?: EventInit & { detail: Activity }) {
    super(type, eventInitDict);
  }
}

interface EventListener<T extends Event> {
  (evt: T): void;
}

interface EventListenerObject<T extends Event> {
  handleEvent(object: T): void;
}

type NativeAPIEventMap = {
  incomingactivity: IncomingActivityEvent;
};

class NativeAPIEventTarget extends EventTarget {
  addEventListener(
    type: keyof NativeAPIEventMap,
    listener: EventListener<NativeAPIEventMap[typeof type]> | EventListenerObject<NativeAPIEventMap[typeof type]>,
    options?: AddEventListenerOptions | boolean
  ): void {
    super.addEventListener(type, listener, options);
  }

  removeEventListener(
    type: keyof NativeAPIEventMap,
    listener: EventListener<NativeAPIEventMap[typeof type]> | EventListenerObject<NativeAPIEventMap[typeof type]>,
    options?: EventListenerOptions | boolean
  ): void {
    super.removeEventListener(type, listener, options);
  }
}

class NativeAPI {
  constructor() {
    this.UNSAFE_callBreakpoint = {} as NativeAPIBreakpoint;

    for (const name of BREAKPOINT_NAMES) {
      // Must be from one of our hardcoded strings.
      // eslint-disable-next-line security/detect-object-injection
      this.UNSAFE_callBreakpoint[name] = SHOULD_LOCKDOWN
        ? // eslint-disable-next-line security/detect-object-injection
          this.#breakpoint[name].bind(this, this.#debugContext)
        : () => {
            // eslint-disable-next-line security/detect-object-injection
            this.#breakpoint[name](this.#debugContext);
          };
    }
  }

  #breakpoint: NativeAPIBreakpoint = new NativeAPIBreakpoint();
  #debugContext: NativeAPIDebugContext = { activities: Object.freeze([]) };
  #eventTarget: NativeAPIEventTarget = new NativeAPIEventTarget();

  get breakpoint(): NativeAPIBreakpoint {
    return this.#breakpoint;
  }

  get eventTarget(): NativeAPIEventTarget {
    return this.#eventTarget;
  }

  UNSAFE_callBreakpoint: NativeAPIBreakpoint;

  UNSAFE_extendsDebugContext(name: keyof NativeAPIDebugContext, getter: () => any) {
    Object.defineProperty(this.#debugContext, name, {
      configurable: true,
      get() {
        return getter();
      }
    });
  }
}

function createNativeAPI(): NativeAPI {
  return new NativeAPI();
}

export default createNativeAPI;
export { IncomingActivityEvent, NativeAPI };
export type { NativeAPIBreakpoint, NativeAPIDebugContext, NativeAPIEventTarget };
