/* eslint complexity: ["error", 50] */

import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import RovingTabIndexContext from './private/Context';

import type { FC, MutableRefObject, PropsWithChildren } from 'react';
import type { RovingTabIndexContextType } from './private/Context';

type ItemRef = MutableRefObject<HTMLElement | undefined>;

type RovingTabIndexContextProps = PropsWithChildren<{
  onEscapeKey?: () => void;
  orientation?: 'horizontal' | 'vertical';
}>;

const RovingTabIndexComposer: FC<RovingTabIndexContextProps> = ({ children, onEscapeKey, orientation }) => {
  const activeItemIndexRef = useRef(0);
  const itemRefsRef = useRef<ItemRef[]>([]);

  const refreshTabIndices = useCallback(() => {
    const { current: activeItemIndex } = activeItemIndexRef;

    itemRefsRef.current.forEach(({ current }, index) => {
      current?.setAttribute('tabindex', activeItemIndex === index ? '0' : '-1');
    });
  }, [activeItemIndexRef]);

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
      // This make sure at least one of the item in the container is selected.
      if (nextActiveItemIndex && !itemRefsRef.current[+nextActiveItemIndex]?.current) {
        nextActiveItemIndex = 0;
      }

      if (activeItemIndexRef.current !== nextActiveItemIndex) {
        activeItemIndexRef.current = nextActiveItemIndex;

        refreshTabIndices();
        itemRefsRef.current[+nextActiveItemIndex]?.current?.focus();
      }
    },
    [activeItemIndexRef, itemRefsRef, refreshTabIndices]
  );

  const handleFocus = useCallback(
    event => {
      const { target } = event;

      const index = itemRefsRef.current.findIndex(({ current }) => current === target);

      ~index && setActiveItemIndex(index);
    },
    [itemRefsRef, setActiveItemIndex]
  );

  const handleKeyDown = useCallback<(event: KeyboardEvent) => void>(
    event => {
      const { key } = event;
      const vertical = orientation === 'vertical';

      switch (key) {
        case 'ArrowDown':
        case 'ArrowRight':
        case 'Down': // IE11
        case 'Right': // IE11
          if ((vertical && key === 'ArrowRight') || (!vertical && key === 'ArrowDown')) {
            return;
          }

          setActiveItemIndex(value => {
            // The `itemRefsRef` array could be a sparse array.
            // Thus, the next item may not be immediately next to the current one.
            const itemIndices = itemRefsRef.current.map((_, index) => index);
            const nextIndex = itemIndices.indexOf(value) + 1;

            if (nextIndex >= itemIndices.length) {
              return itemIndices[0];
            }

            return itemIndices[+nextIndex];
          });

          break;

        case 'ArrowLeft':
        case 'ArrowUp':
        case 'Left': // IE11
        case 'Up': // IE11
          if ((vertical && key === 'ArrowLeft') || (!vertical && key === 'ArrowUp')) {
            return;
          }

          setActiveItemIndex(value => {
            // The `itemRefsRef` array could be a sparse array.
            // Thus, the next item may not be immediately next to the current one.
            const itemIndices = itemRefsRef.current.map((_, index) => index);
            const nextIndex = itemIndices.indexOf(value) - 1;

            if (nextIndex < 0) {
              return itemIndices[itemIndices.length - 1];
            }

            return itemIndices[+nextIndex];
          });

          break;

        case 'Home':
          setActiveItemIndex(0);
          break;

        case 'End':
          setActiveItemIndex(Infinity);
          break;

        case 'Escape':
          if (!onEscapeKey) {
            // If the "onEscapeKey" prop is not passed, don't call preventDefault() and stopPropagation().
            return;
          }

          onEscapeKey();
          break;

        default:
          return;
      }

      event.preventDefault();
      event.stopPropagation();
    },
    [setActiveItemIndex, onEscapeKey, orientation]
  );

  const itemEffector = useCallback(
    (ref, index) => {
      const { current } = ref;

      itemRefsRef.current[+index] = ref;

      current.addEventListener('focus', handleFocus);
      current.addEventListener('keydown', handleKeyDown);

      current.setAttribute('tabindex', activeItemIndexRef.current === index ? '0' : '-1');

      return () => {
        current.removeEventListener('focus', handleFocus);
        current.removeEventListener('keydown', handleKeyDown);

        delete itemRefsRef.current[+index];
      };
    },
    [activeItemIndexRef, handleFocus, handleKeyDown]
  );

  const contextValue = useMemo<RovingTabIndexContextType>(
    () => ({
      itemEffector
    }),
    [itemEffector]
  );

  // This hook run on every render to rectify `activeItemIndexRef`.
  // So it will always point to an existing item or first item if available.
  useEffect(() => {
    setActiveItemIndex(value => value);
  });

  return <RovingTabIndexContext.Provider value={contextValue}>{children}</RovingTabIndexContext.Provider>;
};

RovingTabIndexComposer.defaultProps = {
  onEscapeKey: undefined,
  orientation: 'horizontal'
};

RovingTabIndexComposer.propTypes = {
  onEscapeKey: PropTypes.func,
  orientation: PropTypes.oneOf(['horizontal', 'vertical'])
};

export default RovingTabIndexComposer;
