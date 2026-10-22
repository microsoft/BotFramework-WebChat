import { type RefCallback } from 'react';

import useCarouselActionsContext from './private/useCarouselActionsContext';

/** Returns the ref callback for the element that scrolls horizontally. */
export default function useCarouselScrollableRef(): RefCallback<HTMLElement> {
  return useCarouselActionsContext().scrollableRef;
}
