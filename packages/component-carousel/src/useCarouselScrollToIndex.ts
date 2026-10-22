import { useCallback } from 'react';
import { integer, number, parse, pipe } from 'valibot';

import useCarouselActionsContext from './private/useCarouselActionsContext';

const indexSchema = pipe(number(), integer());

/** Returns a function that scrolls to the item and centers it, as far as the scrollable range allows. */
export default function useCarouselScrollToIndex(): (index: number) => void {
  const { scrollToIndex } = useCarouselActionsContext();

  return useCallback(index => scrollToIndex(parse(indexSchema, index)), [scrollToIndex]);
}
