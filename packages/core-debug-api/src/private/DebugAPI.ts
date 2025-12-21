import type { BreakpointObject, DebugAPIType } from '../types';

class DebugAPI<TBreakpointName extends string, TContext extends object> implements DebugAPIType<
  TBreakpointName,
  TContext
> {
  constructor(breakpoint: BreakpointObject<string, TContext>, context: TContext) {
    this.#breakpoint = breakpoint;
    this.#context = context;

    Object.freeze(this);
  }

  #breakpoint: BreakpointObject<string, TContext>;
  #context: TContext;

  get breakpoint() {
    return this.#breakpoint;
  }

  get debugger() {
    // @ts-expect-error Unused variable for debugging.
    const __DEBUG_CONTEXT__ = this.#context;

    // eslint-disable-next-line no-debugger
    debugger;

    return undefined;
  }
}

export default DebugAPI;
