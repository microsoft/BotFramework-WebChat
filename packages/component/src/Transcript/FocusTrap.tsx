/* eslint-disable no-magic-numbers */
import React, { KeyboardEventHandler, memo, type FocusEvent, type ReactNode, useCallback, useRef } from 'react';

import tabbableElements from '../Utils/tabbableElements';
import { useRefFrom } from 'use-ref-from';

const FocusTrap = ({
  children,
  onFocus,
  onLeave
}: Readonly<{
  children: ReactNode;
  onFocus: () => void;
  onLeave: () => void;
}>) => {
  const bodyRef = useRef<HTMLDivElement>();
  const lastFocused = useRef<HTMLElement>();
  const onLeaveRef = useRefFrom<() => void>(onLeave);

  const getTabbableElementsInBody = useCallback(
    () => tabbableElements(bodyRef.current).filter(element => element.getAttribute('aria-disabled') !== 'true'),
    [bodyRef]
  );

  const handleBodyKeyDown: KeyboardEventHandler = useCallback(
    event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();

        onLeaveRef.current?.();
      } else if (event.key === 'Tab') {
        const activeElement = document.activeElement as HTMLElement;
        const focusables = getTabbableElementsInBody();
        const focusedIndex = getTabbableElementsInBody().indexOf(activeElement);
        if (event.shiftKey && focusedIndex === 0) {
          event.preventDefault();
          const lastTabbableElement = focusables.at(-1);
          lastTabbableElement ? lastTabbableElement.focus() : onLeaveRef.current?.();
          focusables.at(-1)?.focus();
        } else if (!event.shiftKey && focusedIndex === focusables.length - 1) {
          event.preventDefault();
          const firstTabbableElement = focusables.at(0);
          firstTabbableElement ? firstTabbableElement.focus() : onLeaveRef.current?.();
        }
      }
    },
    [getTabbableElementsInBody, onLeaveRef]
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLDivElement, Element>) => {
      const { relatedTarget } = event;
      if (
        (!relatedTarget || !bodyRef.current?.contains(relatedTarget)) &&
        lastFocused.current?.parentElement &&
        getTabbableElementsInBody().includes(lastFocused.current)
      ) {
        lastFocused.current?.focus();
      } else {
        onFocus();
        lastFocused.current = event.target;
      }
    },
    [getTabbableElementsInBody, onFocus]
  );

  const handleBlur = useCallback(
    event => {
      const { relatedTarget } = event;
      const focusables = getTabbableElementsInBody();

      // When blurred element became non-focusable, move to the first focusable element if available
      // Otherwise trigger leave
      if (bodyRef.current?.contains(relatedTarget) && !focusables.includes(relatedTarget)) {
        event.preventDefault();
        event.stopPropagation();
        const firstTabbableElement = focusables.at(0);
        firstTabbableElement ? firstTabbableElement.focus() : onLeaveRef.current?.();
      }
    },
    [getTabbableElementsInBody, onLeaveRef]
  );

  return (
    <div onBlur={handleBlur} onFocus={handleFocus} onKeyDown={handleBodyKeyDown} ref={bodyRef}>
      {children}
    </div>
  );
};

FocusTrap.displayName = 'FocusTrap';

export default memo(FocusTrap);
