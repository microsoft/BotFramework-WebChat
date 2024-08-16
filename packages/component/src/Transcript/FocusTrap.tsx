/* eslint-disable no-magic-numbers */
import React, {
  Fragment,
  memo,
  type FocusEvent,
  type KeyboardEventHandler,
  type ReactNode,
  useCallback,
  useRef
} from 'react';

import tabbableElements from '../Utils/tabbableElements';
import { useRefFrom } from 'use-ref-from';

const FocusTrap = ({
  children,
  onFocus,
  onLeave,
  targetClassName
}: Readonly<{
  children: ReactNode;
  onFocus: () => void;
  onLeave: () => void;
  targetClassName?: string | undefined;
}>) => {
  const bodyRef = useRef<HTMLDivElement>();
  const lastFocused = useRef<HTMLElement>();
  const onLeaveRef = useRefFrom(onLeave);

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
      onFocus();
      lastFocused.current = event.target;
    },
    [lastFocused, onFocus]
  );

  const handleBlur = useCallback(
    event => {
      const { target } = event;
      const focusables = getTabbableElementsInBody();

      // When blurred element became non-focusable, move to the first focusable element if available
      // Otherwise trigger leave
      if (!focusables.includes(target)) {
        event.preventDefault();
        event.stopPropagation();
        focusOrTriggerLeave(focusables.at(0));
      }
    },
    [bodyRef, focusOrTriggerLeave, getTabbableElementsInBody]
  );

  const handleTrapFocus = useCallback(
    event => {
      event.preventDefault();
      event.stopPropagation();
      event.target.blur();

      const focusables = getTabbableElementsInBody();
      if (lastFocused.current && focusables.includes(lastFocused.current)) {
        lastFocused.current.focus();
      } else {
        focusOrTriggerLeave(focusables.at(0));
      }
    },
    [focusOrTriggerLeave, getTabbableElementsInBody]
  );

  return (
    <Fragment>
      <div onBlur={handleBlur} onFocus={handleFocus} onKeyDown={handleBodyKeyDown} ref={bodyRef}>
        {children}
      </div>
      <div aria-hidden="true" className={targetClassName} onFocus={handleTrapFocus} tabIndex={-1} />
    </Fragment>
  );
};

FocusTrap.displayName = 'FocusTrap';

export default memo(FocusTrap);
