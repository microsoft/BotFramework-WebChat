// A step must move by more than this, so items that cannot be centered (clamped at an edge) are skipped.
const TOLERANCE = 1;

/**
 * Finds the scroll position of the previous or next item in reading order.
 *
 * @param itemPositions scroll positions that center each item, clamped to the scrollable range, in reading order
 * @param position current (or pending) scroll position
 * @param direction `"next"` or `"previous"`
 * @returns scroll position of the item, or `undefined` if there is no item in that direction
 */
export default function findAdjacentPosition(
  itemPositions: readonly number[],
  position: number,
  direction: 'next' | 'previous'
): number | undefined {
  return direction === 'next'
    ? itemPositions.find(itemPosition => itemPosition > position + TOLERANCE)
    : itemPositions.reduce<number | undefined>(
        (lastPosition, itemPosition) => (itemPosition < position - TOLERANCE ? itemPosition : lastPosition),
        undefined
      );
}
