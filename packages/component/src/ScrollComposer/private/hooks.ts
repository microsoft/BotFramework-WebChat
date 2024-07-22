import { useMemo, useContext } from 'react';
import { ScrollContext } from './ScrollComposer';

export const useObserveScroll = (callback: any) => {
  const { observeScroll } = useContext(ScrollContext);
  return useMemo(() => observeScroll(callback), [observeScroll, callback]);
};

export const useScrollAnimatingToEnd = () => {
  const { isAnimatingToEnd } = useContext(ScrollContext);
  return [isAnimatingToEnd] as const;
};

export const useScrollAtEnd = () => {
  const { isAtEnd } = useContext(ScrollContext);
  return [isAtEnd] as const;
};

export const useScrollTo = () => {
  const { scrollTo } = useContext(ScrollContext);
  return scrollTo;
};

export const useScrollToEnd = () => {
  const { scrollToEnd } = useContext(ScrollContext);
  return scrollToEnd;
};

export const useScrollSticky = () => {
  const { isSticky } = useContext(ScrollContext);
  return [isSticky] as const;
};
