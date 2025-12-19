/* eslint-disable no-magic-numbers */
import React, {
  type MutableRefObject,
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef
} from 'react';

type ItemRef = MutableRefObject<HTMLElement | undefined>;

type RovingFocusContextType = {
  itemEffector: <T extends HTMLElement>(ref: MutableRefObject<T | null>, index: number) => () => void;
};

const RovingFocusContext = createContext<RovingFocusContextType>({
  itemEffector: () => {
    // This will be implemented when using in <RovingFocusProvider>.
    throw new Error('botframework-webchat-fluent-theme rovingFocus: no provider for RovingFocusContext.');
  }
});

function RovingFocusProvider(
  props: Readonly<{
    children?: React.ReactNode | undefined;
    direction?: 'vertical' | 'horizontal' | undefined;
    onEscapeKey?: () => void;
  }>
) {
  const activeItemIndexRef = useRef(0);
  const itemRefsRef = useRef<ItemRef[]>([]);

  const updateItemTabIndex = useCallback(
    ({ current }: ItemRef, index: number) =>
      current && (current.tabIndex = activeItemIndexRef.current === index ? 0 : -1),
    [activeItemIndexRef]
  );

  const setActiveItemIndex = useCallback(
    (valueOrFunction: number | ((value: number) => number)) => {
      // All calls to this function is expected to be under event handlers (post-rendering).
      let nextActiveItemIndex;

      if (typeof valueOrFunction === 'number') {
        nextActiveItemIndex = valueOrFunction;
      } else {
        nextActiveItemIndex = valueOrFunction(activeItemIndexRef.current);
      }

      // If the index points to no item, fallback to the first item.
      // This makes sure at least one of the item in the container is selected.
      if (nextActiveItemIndex && !itemRefsRef.current.at(nextActiveItemIndex)?.current) {
        nextActiveItemIndex = 0;
      }

      if (activeItemIndexRef.current !== nextActiveItemIndex) {
        activeItemIndexRef.current = nextActiveItemIndex;

        itemRefsRef.current.forEach((ref, index) => updateItemTabIndex(ref, index));
        itemRefsRef.current.at(nextActiveItemIndex)?.current?.focus();
      }
    },
    [updateItemTabIndex, itemRefsRef, activeItemIndexRef]
  );

  const handleFocus = useCallback(
    event => {
      const { target } = event;

      const index = itemRefsRef.current.findIndex(({ current }) => current === target);

      // prevent focusing the last element, if we didn't found the element focused
      if (index !== -1) {
        setActiveItemIndex(index);
      }
    },
    [itemRefsRef, setActiveItemIndex]
  );

  const handleSetNextActive = useCallback(
    (key: string) =>
      (currentIndex: number): number => {
        const isUnidirectional = !props.direction;
        const isVerticalMove = /up|down/iu.test(key) && props.direction === 'vertical';
        const isHorizontalMove = /left|right/iu.test(key) && props.direction === 'horizontal';
        const isForwardMove = /right|down/iu.test(key);
        const direction = isUnidirectional || isVerticalMove || isHorizontalMove ? (isForwardMove ? 1 : -1) : 0;
        // The `itemRefsRef` array could be a sparse array.
        // Thus, the next item may not be immediately next to the current one.
        const itemIndices = itemRefsRef.current.map((_, index) => index);
        const nextIndex = itemIndices.indexOf(currentIndex) + direction;

        return itemIndices.at(nextIndex) ?? 0;
      },
    [props.direction]
  );

  const handleKeyDown = useCallback<(event: KeyboardEvent) => void>(
    event => {
      const { key } = event;

      switch (key) {
        case 'Up':
        case 'ArrowUp':
        case 'Left':
        case 'ArrowLeft':
        case 'Down':
        case 'ArrowDown':
        case 'Right':
        case 'ArrowRight':
          setActiveItemIndex(handleSetNextActive(key));
          break;

        case 'Home':
          setActiveItemIndex(0);
          break;

        case 'End':
          setActiveItemIndex(-1);
          break;

        case 'Escape':
          props.onEscapeKey?.();
          break;

        default:
          return;
      }

      event.preventDefault();
      event.stopPropagation();
    },
    [setActiveItemIndex, handleSetNextActive, props]
  );

  const itemEffector = useCallback(
    (ref, index) => {
      const { current } = ref;

      itemRefsRef.current[Number(index)] = ref;

      current.addEventListener('focus', handleFocus);
      current.addEventListener('keydown', handleKeyDown);

      updateItemTabIndex(ref, index);

      return () => {
        current.removeEventListener('focus', handleFocus);
        current.removeEventListener('keydown', handleKeyDown);

        delete itemRefsRef.current[Number(index)];
      };
    },
    [handleFocus, handleKeyDown, updateItemTabIndex, itemRefsRef]
  );

  const value = useMemo<RovingFocusContextType>(
    () => ({
      itemEffector
    }),
    [itemEffector]
  );

  return <RovingFocusContext.Provider value={value}>{props.children}</RovingFocusContext.Provider>;
}

export function useRovingFocusItemRef<T extends HTMLElement>(itemIndex: number): MutableRefObject<T | null> {
  const ref = useRef<T>(null);

  const { itemEffector } = useContext(RovingFocusContext);

  useEffect(() => itemEffector(ref, itemIndex));

  return ref;
}

export default memo(RovingFocusProvider);
