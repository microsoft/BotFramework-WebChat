/* eslint no-magic-numbers: ["error", { "ignore": [0, 2] }] */

type ComputeItemPositionInit = {
  /** Width of the scrollport, i.e. `clientWidth`. */
  readonly clientWidth: number;

  /** Distance from the inline-start edge of the scrollable content to the center of the item. */
  readonly itemCenter: number;

  /** Largest scroll position, i.e. `scrollWidth - clientWidth`. */
  readonly maxPosition: number;
};

/**
 * Computes the scroll position that centers the item, clamped to the scrollable range, as `scroll-snap-align: center`
 * does.
 */
export default function computeItemPosition({ clientWidth, itemCenter, maxPosition }: ComputeItemPositionInit): number {
  return Math.max(0, Math.min(maxPosition, itemCenter - clientWidth / 2));
}

export { type ComputeItemPositionInit };
