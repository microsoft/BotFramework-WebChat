/* eslint no-magic-numbers: ["error", { "ignore": [0, 2] }] */

import computeItemPosition from './computeItemPosition';

type ScrollMeasurement = {
  /** Largest scroll position. */
  readonly maxPosition: number;

  /** Distance scrolled from the inline-start edge, always zero or positive. */
  readonly position: number;
};

type Measurement = ScrollMeasurement & {
  /** Scroll positions that center each item, clamped to the scrollable range, in reading order. */
  readonly itemPositions: readonly number[];

  /** Whether the scrollable is right-to-left: `scrollLeft` is then zero or negative. */
  readonly rtl: boolean;
};

/**
 * Measures the scroll position of the scrollable, in LTR and RTL, without forcing a style recalculation.
 *
 * All supported browsers use the standard RTL model: `scrollLeft` is 0 at the inline-start edge and negative towards
 * the inline-end edge.
 */
function measureScroll({ clientWidth, scrollLeft, scrollWidth }: HTMLElement): ScrollMeasurement {
  return Object.freeze({
    maxPosition: Math.max(0, scrollWidth - clientWidth),
    position: Math.abs(scrollLeft)
  });
}

/**
 * Measures the scrollable and the items in reading order, in LTR and RTL.
 */
export default function measure(scrollable: HTMLElement, itemContainer: HTMLElement): Measurement {
  const { clientLeft, clientWidth } = scrollable;
  const { left } = scrollable.getBoundingClientRect();
  const { maxPosition, position } = measureScroll(scrollable);
  const rtl = getComputedStyle(scrollable).direction === 'rtl';

  // The inline-start edge of the scrollport, in viewport coordinates.
  const scrollportStart = left + clientLeft + (rtl ? clientWidth : 0);

  return Object.freeze({
    itemPositions: Object.freeze(
      Array.from(itemContainer.children, item => {
        const itemRect = item.getBoundingClientRect();
        const center = (itemRect.left + itemRect.right) / 2;

        return computeItemPosition({
          clientWidth,
          itemCenter: position + (rtl ? scrollportStart - center : center - scrollportStart),
          maxPosition
        });
      })
    ),
    maxPosition,
    position,
    rtl
  });
}

export { measureScroll, type Measurement };
