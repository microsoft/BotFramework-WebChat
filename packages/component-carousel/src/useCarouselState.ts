import { useContext, useMemo } from 'react';

import { CarouselStateContext } from './private/CarouselContext';
import { type CarouselState } from './types/CarouselState';

/** Returns whether the carousel overflows, is at either edge, or is scrolling. */
export default function useCarouselState(): readonly [CarouselState] {
  const state = useContext(CarouselStateContext);

  if (!state) {
    throw new Error('botframework-webchat: Carousel hooks must be used under <CarouselComposer>.');
  }

  return useMemo(() => Object.freeze([state] as const), [state]);
}
