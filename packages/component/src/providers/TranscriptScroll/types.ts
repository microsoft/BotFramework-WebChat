type ScrollBehavior = 'auto' | 'smooth';

/**
 * Auto-scroll limiter (a.k.a. auto-scroll snap).
 *
 * Called before following new content, returns how many pixels to scroll down. `Infinity` means scroll to the end.
 */
type Scroller = (init: {
  readonly offsetHeight: number;
  readonly scrollHeight: number;
  readonly scrollTop: number;
}) => number;

type ScrollToOptions = {
  readonly behavior?: ScrollBehavior | undefined;
};

export { type ScrollBehavior, type Scroller, type ScrollToOptions };
