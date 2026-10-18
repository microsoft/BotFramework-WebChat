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

// Media elements with native controls (`<audio controls>` and `<video controls>`) have their own tab stops,
// such as play, volume, and more options. These tab stops are in a closed shadow tree: we cannot focus them,
// and their keystrokes do not reach us. The browser moves focus through them on TAB,
// and the guard at the end of the body wraps the focus after the last one.
function hasNativeControls(element: Element | undefined): boolean {
  return element instanceof HTMLMediaElement && element.controls;
}

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
  const guardRef = useRef<HTMLDivElement>();
  const lastFocused = useRef<HTMLElement>();
  const onFocusRef = useRefFrom(onFocus);
  const onLeaveRef = useRefFrom(onLeave);
  const passingThroughGuardRef = useRef(false);

  const getTabbableElementsInBody = useCallback(() => {
    const nestedTraps = Array.from(bodyRef.current?.querySelectorAll('.webchat__focus-trap'));
    return tabbableElements(bodyRef.current)
      .filter(element => element !== guardRef.current)
      .filter(element => element.getAttribute('aria-disabled') !== 'true')
      .filter(element => !nestedTraps.some(trap => trap.contains(element)));
  }, [bodyRef, guardRef]);

  const focusOrTriggerLeave = useCallback(
    (element: HTMLElement | undefined) => (element ? element.focus() : onLeaveRef.current?.()),
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
        const focusedIndex = focusables.indexOf(activeElement);

        if (event.shiftKey && focusedIndex === 0) {
          if (hasNativeControls(focusables.at(-1))) {
            // The last tab stop is a native control of the media element, which we cannot focus.
            // Without preventing the default, the browser continues SHIFT+TAB from the guard into that control.
            passingThroughGuardRef.current = true;
            guardRef.current?.focus({ preventScroll: true });
            passingThroughGuardRef.current = false;
          } else {
            event.preventDefault();

            focusOrTriggerLeave(focusables.at(-1));
          }
        } else if (!event.shiftKey && focusedIndex === focusables.length - 1 && !hasNativeControls(activeElement)) {
          event.preventDefault();

          focusOrTriggerLeave(focusables.at(0));
        }
      }
    },
    [focusOrTriggerLeave, getTabbableElementsInBody, guardRef, onLeaveRef, passingThroughGuardRef]
  );

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLDivElement, Element>) => {
      onFocusRef.current?.();

      if (event.target !== guardRef.current) {
        lastFocused.current = event.target;
      } else if (!passingThroughGuardRef.current) {
        // TAB from the last native control of a media element: wrap to the first element.
        focusOrTriggerLeave(getTabbableElementsInBody().at(0));
      }
    },
    [focusOrTriggerLeave, getTabbableElementsInBody, guardRef, lastFocused, onFocusRef, passingThroughGuardRef]
  );

  const handleBlur = useCallback(
    event => {
      const { target } = event;
      const focusables = getTabbableElementsInBody();

      // When blurred element became non-focusable, move to the first focusable element if available.
      // Otherwise trigger leave.
      if (target !== guardRef.current && !focusables.includes(target)) {
        event.preventDefault();
        event.stopPropagation();

        focusOrTriggerLeave(focusables.at(0));
      } else if (bodyRef.current.contains(target)) {
        event.stopPropagation();
      }
    },
    [focusOrTriggerLeave, getTabbableElementsInBody, guardRef]
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
      <div
        className="webchat__focus-trap"
        onBlur={handleBlur}
        onFocus={handleFocus}
        onKeyDown={handleBodyKeyDown}
        ref={bodyRef}
      >
        {children}
        <div ref={guardRef} tabIndex={0} />
      </div>
      <div aria-hidden="true" className={targetClassName} onFocus={handleTrapFocus} tabIndex={-1} />
    </Fragment>
  );
};

FocusTrap.displayName = 'FocusTrap';

export default memo(FocusTrap);
