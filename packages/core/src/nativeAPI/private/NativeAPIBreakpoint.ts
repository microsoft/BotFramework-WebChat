import type { ArrayElement } from 'type-fest';

const BREAKPOINT_NAMES = Object.freeze(['incomingActivity'] as const);

// #region Types assertion
let ACTUAL_BREAKPOINT_NAMES: keyof NativeAPIBreakpoint;

ACTUAL_BREAKPOINT_NAMES satisfies ArrayElement<typeof BREAKPOINT_NAMES>;
BREAKPOINT_NAMES.at(0) satisfies typeof ACTUAL_BREAKPOINT_NAMES;
// #endregion

/* eslint-disable class-methods-use-this, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */
class NativeAPIBreakpoint {
  /**
   * Will be called when an incoming activity is received.
   */
  incomingActivity(__DEBUG_CONTEXT__) {}
}
/* eslint-enable class-methods-use-this, @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars */

export default NativeAPIBreakpoint;
export { BREAKPOINT_NAMES };
