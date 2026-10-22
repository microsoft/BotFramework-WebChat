import { type RefCallback } from 'react';

import useCarouselActionsContext from './private/useCarouselActionsContext';

/** Returns the ref callback for the element whose element children are the items, in reading order. */
export default function useCarouselItemContainerRef(): RefCallback<HTMLElement> {
  return useCarouselActionsContext().itemContainerRef;
}
