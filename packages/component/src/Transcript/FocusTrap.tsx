/* eslint-disable no-magic-numbers */
import React, { KeyboardEventHandler, memo, type FocusEvent, type ReactNode, useCallback, useRef } from 'react';

import tabbableElements from '../Utils/tabbableElements';
import { useRefFrom } from 'use-ref-from';

const FocusTrap = ({
  children,
  className,
  onFocus,
  onLeave
}: Readonly<{
  children: ReactNode;
  className?: string | undefined;
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

  const focusOrTriggerLeave = useCallback(
    (el: HTMLElement | undefined) => (el ? el.focus() : onLeaveRef.current?.()),
    [onLeaveRef]
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
          focusOrTriggerLeave(focusables.at(-1));
        } else if (!event.shiftKey && focusedIndex === focusables.length - 1) {
          event.preventDefault();
          focusOrTriggerLeave(focusables.at(0));
        }
      }
    },
    [focusOrTriggerLeave, getTabbableElementsInBody, onLeaveRef]
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLDivElement, Element>) => {
      const { target } = event;

      if (target === bodyRef.current) {
        event.preventDefault();
        event.stopPropagation();
        target.blur();

        const focusables = getTabbableElementsInBody();
        if (lastFocused.current && focusables.includes(lastFocused.current)) {
          lastFocused.current.focus();
        } else {
          focusOrTriggerLeave(focusables.at(0));
        }
      } else {
        onFocus();
        lastFocused.current = event.target;
      }
    },
    [focusOrTriggerLeave, getTabbableElementsInBody, onFocus]
  );

  const handleBlur = useCallback(
    event => {
      const { target } = event;
      const focusables = getTabbableElementsInBody();

      // When blurred element became non-focusable, move to the first focusable element if available
      // Otherwise trigger leave
      if (target !== bodyRef.current && !focusables.includes(target)) {
        event.preventDefault();
        event.stopPropagation();
        focusOrTriggerLeave(focusables.at(0));
      }
    },
    [focusOrTriggerLeave, getTabbableElementsInBody]
  );

  return (
    <div
      className={className}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onKeyDown={handleBodyKeyDown}
      ref={bodyRef}
      tabIndex={-1}
    >
      {children}
    </div>
  );
};

FocusTrap.displayName = 'FocusTrap';

export default memo(FocusTrap);
