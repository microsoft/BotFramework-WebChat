import { useCallback } from 'react';
import { parse, picklist } from 'valibot';

import useCarouselActionsContext from './private/useCarouselActionsContext';

const directionSchema = picklist(['next', 'previous']);

/**
 * Returns a function that scrolls to the next or previous item in reading order and centers it, as far as the scrollable
 * range allows. Items that cannot move into the center (clamped at an edge) are skipped.
 */
export default function useCarouselScrollBy(): (direction: 'next' | 'previous') => void {
  const { scrollBy } = useCarouselActionsContext();

  return useCallback(direction => scrollBy(parse(directionSchema, direction)), [scrollBy]);
}
