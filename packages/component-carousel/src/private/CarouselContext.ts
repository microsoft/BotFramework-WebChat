import { createContext, type RefCallback } from 'react';

import { type CarouselState } from '../types/CarouselState';

type CarouselActionsContextType = {
  readonly itemContainerRef: RefCallback<HTMLElement>;
  readonly scrollableRef: RefCallback<HTMLElement>;
  readonly scrollBy: (direction: 'next' | 'previous') => void;
  readonly scrollToIndex: (index: number) => void;
};

const CarouselActionsContext = createContext<CarouselActionsContextType | undefined>(undefined);
const CarouselStateContext = createContext<CarouselState | undefined>(undefined);

CarouselActionsContext.displayName = 'CarouselActionsContext';
CarouselStateContext.displayName = 'CarouselStateContext';

export { CarouselActionsContext, CarouselStateContext, type CarouselActionsContextType };
