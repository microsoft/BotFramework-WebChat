import { reactNode, validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { args, function_, number, object, optional, pipe, readonly, returns, tuple, void_ } from 'valibot';

import {
  CarouselActionsContext,
  CarouselStateContext,
  type CarouselActionsContextType
} from './private/CarouselContext';
import computeEdges from './private/computeEdges';
import findAdjacentPosition from './private/findAdjacentPosition';
import measure, { measureScroll, type Measurement } from './private/measure';
import { type CarouselState } from './types/CarouselState';

// Same as react-film: the carousel is "scrolling" until 500 ms after the last scroll event.
const SCROLLING_TIMEOUT = 500;

const INITIAL_STATE: CarouselState = Object.freeze({
  atEnd: true,
  atStart: true,
  overflowing: false,
  scrolling: false
});

const carouselComposerPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    /** Clock functions, e.g. Web Chat's `usePonyfill()`, so tests can use fake timers. */
    ponyfill: pipe(
      object({
        clearTimeout: pipe(function_(), args(tuple([optional(number())])), returns(void_())),
        setTimeout: pipe(function_(), args(tuple([pipe(function_(), returns(void_())), number()])), returns(number()))
      }),
      readonly()
    )
  }),
  readonly()
);

type CarouselComposerProps = InferReactProps<typeof carouselComposerPropsSchema>;

function patchState(state: CarouselState, patch: Partial<CarouselState>): CarouselState {
  const nextState = { ...state, ...patch };

  return nextState.atEnd === state.atEnd &&
    nextState.atStart === state.atStart &&
    nextState.overflowing === state.overflowing &&
    nextState.scrolling === state.scrolling
    ? state
    : Object.freeze(nextState);
}

/**
 * Headless carousel: tracks the scrollable element and its items, and scrolls item by item.
 *
 * Markup and styles are up to the consumer: set the scrollable with `useCarouselScrollableRef()`, the element whose
 * children are the items with `useCarouselItemContainerRef()`.
 */
function CarouselComposer(props: CarouselComposerProps) {
  const {
    children,
    ponyfill: { clearTimeout, setTimeout }
  } = validateProps(carouselComposerPropsSchema, props);

  const [itemContainer, setItemContainer] = useState<HTMLElement | null>(null);
  const [scrollable, setScrollable] = useState<HTMLElement | null>(null);
  const [state, setState] = useState<CarouselState>(INITIAL_STATE);
  // Where a smooth scroll started by `scrollBy()`/`scrollToIndex()` will end, so repeated steps continue from there.
  const pendingPositionRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!scrollable) {
      return;
    }

    let scrollingTimeout: number | undefined;

    // Browsers fire scroll events and resize observations at most once per frame.
    const update = () => {
      const { maxPosition, position } = measureScroll(scrollable);

      // The smooth scroll has arrived.
      Math.abs(position - (pendingPositionRef.current ?? NaN)) < 1 && (pendingPositionRef.current = undefined);

      setState(state => patchState(state, computeEdges({ maxPosition, position })));
    };

    const handleScroll = () => {
      update();
      setState(state => patchState(state, { scrolling: true }));

      clearTimeout(scrollingTimeout);

      scrollingTimeout = setTimeout(() => {
        pendingPositionRef.current = undefined;
        setState(state => patchState(state, { scrolling: false }));
      }, SCROLLING_TIMEOUT);
    };

    // The user took over the scroll.
    const handleUserScroll = () => {
      pendingPositionRef.current = undefined;
    };

    // Resizing the scrollable or an item (viewport resize, late image load) can change the edges.
    // Items are observed one by one: they can overflow the item container without resizing it.
    const resizeObserver = new ResizeObserver(update);

    const observe = () => {
      resizeObserver.disconnect();
      resizeObserver.observe(scrollable);

      if (itemContainer) {
        resizeObserver.observe(itemContainer);

        for (const item of Array.from(itemContainer.children)) {
          resizeObserver.observe(item);
        }
      }
    };

    // Items added or removed: observe the new set, the initial observations update the edges.
    const mutationObserver = new MutationObserver(observe);

    observe();
    itemContainer && mutationObserver.observe(itemContainer, { childList: true });

    scrollable.addEventListener('pointerdown', handleUserScroll, { passive: true });
    scrollable.addEventListener('scroll', handleScroll, { passive: true });
    scrollable.addEventListener('wheel', handleUserScroll, { passive: true });

    return () => {
      clearTimeout(scrollingTimeout);
      mutationObserver.disconnect();
      resizeObserver.disconnect();

      scrollable.removeEventListener('pointerdown', handleUserScroll);
      scrollable.removeEventListener('scroll', handleScroll);
      scrollable.removeEventListener('wheel', handleUserScroll);
    };
  }, [clearTimeout, itemContainer, scrollable, setTimeout]);

  const scrollToPosition = useCallback(
    ({ rtl }: Measurement, position: number) => {
      pendingPositionRef.current = position;

      // `scrollTo()` on the scrollable (unlike `scrollIntoView()`) does not scroll its ancestors, e.g. the transcript.
      scrollable?.scrollTo({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        left: rtl ? -position : position
      });
    },
    [scrollable]
  );

  const scrollBy = useCallback<CarouselActionsContextType['scrollBy']>(
    direction => {
      if (scrollable && itemContainer) {
        const measurement = measure(scrollable, itemContainer);
        const { itemPositions, position } = measurement;

        const itemPosition = findAdjacentPosition(itemPositions, pendingPositionRef.current ?? position, direction);

        typeof itemPosition === 'number' && scrollToPosition(measurement, itemPosition);
      }
    },
    [itemContainer, scrollable, scrollToPosition]
  );

  const scrollToIndex = useCallback<CarouselActionsContextType['scrollToIndex']>(
    index => {
      if (scrollable && itemContainer) {
        const measurement = measure(scrollable, itemContainer);
        const { itemPositions } = measurement;

        const itemPosition = itemPositions[Math.max(0, Math.min(itemPositions.length - 1, index))];

        typeof itemPosition === 'number' && scrollToPosition(measurement, itemPosition);
      }
    },
    [itemContainer, scrollable, scrollToPosition]
  );

  const actionsContext = useMemo<CarouselActionsContextType>(
    () =>
      Object.freeze({
        itemContainerRef: setItemContainer,
        scrollableRef: setScrollable,
        scrollBy,
        scrollToIndex
      }),
    [scrollBy, scrollToIndex]
  );

  return (
    <CarouselActionsContext.Provider value={actionsContext}>
      <CarouselStateContext.Provider value={state}>{children}</CarouselStateContext.Provider>
    </CarouselActionsContext.Provider>
  );
}

CarouselComposer.displayName = 'CarouselComposer';

export default memo(CarouselComposer);
export { carouselComposerPropsSchema, type CarouselComposerProps };
