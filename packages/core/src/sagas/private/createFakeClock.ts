type FakeClock = {
  readonly clearTimeout: (handle: unknown) => void;
  readonly setTimeout: (callback: () => void, timeout: number) => number;
  /** Advances the clock and runs due callbacks in time order. */
  readonly tick: (milliseconds: number) => void;
};

/** A minimal fake clock, like the `lolex` clock the html2 tests pass as ponyfill. */
export default function createFakeClock(): FakeClock {
  const timers = new Map<number, { readonly callback: () => void; readonly dueAt: number }>();
  let lastHandle = 0;
  let now = 0;

  return Object.freeze({
    clearTimeout: (handle: unknown) => {
      typeof handle === 'number' && timers.delete(handle);
    },
    setTimeout: (callback: () => void, timeout: number) => {
      timers.set(++lastHandle, Object.freeze({ callback, dueAt: now + timeout }));

      return lastHandle;
    },
    tick: (milliseconds: number) => {
      const until = now + milliseconds;

      for (;;) {
        const [next] = Array.from(timers).sort(([, x], [, y]) => x.dueAt - y.dueAt);

        if (!next || next[1].dueAt > until) {
          break;
        }

        timers.delete(next[0]);
        now = next[1].dueAt;
        next[1].callback();
      }

      now = until;
    }
  });
}
