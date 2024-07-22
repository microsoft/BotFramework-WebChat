import { memo, createContext } from 'react';
import createScrollComposer from './createScrollComposer';

export type ScrollContextType = {
  observeScroll: (callback: (params: { scrollTop: number }) => void) => void;
  isAnimatingToEnd: boolean;
  isAtEnd: boolean;
  isSticky: boolean;
  scrollTo: (scrollTop: number, options?: { behavior?: ScrollBehavior }) => void;
  scrollToEnd: (options?: { behavior?: ScrollBehavior }) => void;
};

export const ScrollContext = createContext<ScrollContextType>(
  new Proxy(
    {},
    {
      get() {
        throw new Error('ScrollContext cannot be used without ScrollComposer');
      }
    }
  ) as unknown as ScrollContextType
);

const ScrollComposer = memo(createScrollComposer(ScrollContext));

ScrollComposer.displayName = 'ScrollComposer';

export default ScrollComposer;
