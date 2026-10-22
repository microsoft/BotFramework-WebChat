import { useContext } from 'react';

import { CarouselActionsContext, type CarouselActionsContextType } from './CarouselContext';

export default function useCarouselActionsContext(): CarouselActionsContextType {
  const context = useContext(CarouselActionsContext);

  if (!context) {
    throw new Error('botframework-webchat: Carousel hooks must be used under <CarouselComposer>.');
  }

  return context;
}
