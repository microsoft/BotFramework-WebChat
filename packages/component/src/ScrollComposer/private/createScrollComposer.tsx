import {
  Composer as ReactScrollToBottomComposer,
  useObserveScrollPosition as useRSBObserveScrollPosition,
  useAnimatingToEnd as useRSBAnimatingToEnd,
  useAtEnd as useRSBAtEnd,
  useSticky as useRSBSticky,
  useScrollTo as useRSBScrollTo,
  useScrollToEnd as useRSBScrollToEnd
} from 'react-scroll-to-bottom';

import React, { Fragment, type Context, type ReactNode, useMemo, useRef, useCallback, memo } from 'react';
import useVirtulScrollEnabled from './useVirtualScrollEnabled';
import { type ScrollContextType } from './ScrollComposer';
import { Scroller } from './useScroller';
import { VListHandle } from 'virtua';

type ScrollProvider = (props: Readonly<{ children?: ReactNode }>) => JSX.Element;

export default function createScrollComposer({ Provider }: Context<ScrollContextType>) {
  const RSBProvider = memo<ScrollProvider>(({ children }) => {
    const [animatingToEnd] = useRSBAnimatingToEnd();
    const [atEnd] = useRSBAtEnd();
    const [sticky] = useRSBSticky();
    const scrollTo = useRSBScrollTo();
    const scrollToEnd = useRSBScrollToEnd();
    const observeScroll = useRSBObserveScrollPosition();

    const contextValue = useMemo(
      () => ({
        observeScroll,
        isAnimatingToEnd: animatingToEnd,
        isAtEnd: atEnd,
        isSticky: sticky,
        scrollTo,
        scrollToEnd
      }),
      [animatingToEnd, atEnd, observeScroll, scrollTo, scrollToEnd, sticky]
    );

    return <Provider value={contextValue}>{children}</Provider>;
  });

  RSBProvider.displayName = 'ReactScrollToBottomScrollProvider';

  const VirtuaProvider = memo<ScrollProvider>(({ children }) => {
    const vListRef = useRef<VListHandle>(null);
    const listRef = useRef<HTMLDivElement>(null);

    const observeScroll = useCallback(() => {
      const list = listRef.current;
      if (list) {
        const handleScroll = () => ({ scrollTop: list.offsetTop });
        list.addEventListener('scroll', handleScroll);
        return () => list.removeEventListener('scroll', handleScroll);
      }
    }, []);

    const scrollTo = useCallback((scrollTop: number) => {
      vListRef.current?.scrollTo(scrollTop);
    }, []);

    const scrollToEnd = useCallback((options?: { behavior?: ScrollBehavior }) => {
      vListRef.current?.scrollToIndex(Infinity, { align: 'end', smooth: options?.behavior === 'smooth' });
    }, []);

    const contextValue = useMemo(
      () => ({
        observeScroll,
        isAnimatingToEnd: false,
        isAtEnd: false,
        isSticky: false,
        scrollTo,
        scrollToEnd
      }),
      [observeScroll, scrollTo, scrollToEnd]
    );

    return <Provider value={contextValue}>{children}</Provider>;
  });

  VirtuaProvider.displayName = 'VirtuaScrollProvider';

  return function ScrollComposer({
    scroller,
    children
  }: Readonly<{ scroller: Scroller; children?: ReactNode | undefined }>) {
    const isVirtualScrollEnabled = useVirtulScrollEnabled();

    return (
      <Fragment>
        {isVirtualScrollEnabled ? (
          <VirtuaProvider>{children}</VirtuaProvider>
        ) : (
          <ReactScrollToBottomComposer scroller={scroller}>
            <RSBProvider>{children}</RSBProvider>
          </ReactScrollToBottomComposer>
        )}
      </Fragment>
    );
  };
}
