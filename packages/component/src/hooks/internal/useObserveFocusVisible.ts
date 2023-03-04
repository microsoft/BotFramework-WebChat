import { hooks } from 'botframework-webchat-api';
import { MutableRefObject, RefObject, useCallback, useEffect, useMemo, useRef } from 'react';

import supportPseudoClass from '../../Utils/supportPseudoClass';
import useNonce from './useNonce';
import useValueRef from './useValueRef';

const { usePonyfill } = hooks;

const INPUT_TYPES_ALLOW_LIST = [
  'date',
  'datetime-local',
  'datetime',
  'email',
  'month',
  'number',
  'password',
  'search',
  'tel',
  'text',
  'time',
  'url',
  'week'
];

/**
 * Computes whether the given element should automatically trigger the
 * `focus-visible` class being added, i.e. whether it should always match
 * `:focus-visible` when focused.
 * @param {Element} el
 * @return {boolean}
 */
function focusTriggersKeyboardModality(el: HTMLInputElement | HTMLTextAreaElement): boolean {
  const { isContentEditable, readOnly, tagName, type } = el;

  return (
    (tagName === 'INPUT' && INPUT_TYPES_ALLOW_LIST.includes(type) && !readOnly) ||
    (tagName === 'TEXTAREA' && !readOnly) ||
    isContentEditable
  );
}

function createEventSubscription(
  target: Element | Node,
  types: string[],
  handler: (event: Event) => void
): {
  pause: () => void;
  resume: () => void;
} {
  let subscribed: true;

  const subscribe = () => {
    if (!subscribed) {
      types.forEach(type => target.addEventListener(type, handler));
      subscribed = true;
    }
  };

  const unsubscribe = () => {
    if (subscribed) {
      types.forEach(type => target.removeEventListener(type, handler));
      subscribed = undefined;
    }
  };

  return {
    pause: unsubscribe,
    resume: subscribe
  };
}

// TODO: Add tests
//       1. Focus via keyboard vs. mouse
//       2. Focus via keyboard, switch app, switch back (expect to get another focusVisible after switch back)
//       3. Focus via mouse, switch app, switch back (do NOT expect to get another focusVisible after switch back)
function useObserveFocusVisibleForLegacyBrowsers(
  targetRef: RefObject<HTMLElement>,
  onFocusVisibleRef: MutableRefObject<() => void>
) {
  const [{ Date }] = usePonyfill();
  // This polyfill algorithm is adopted from https://github.com/WICG/focus-visible.
  const blurSinceRef = useRef(0);
  const hadKeyboardEventRef = useRef(true);
  const hasFocusVisibleRef = useRef(false);

  const eventSubscription = useMemo(
    () =>
      createEventSubscription(
        document,
        [
          'mousemove',
          'mousedown',
          'mouseup',
          'pointermove',
          'pointerdown',
          'pointerup',
          'touchmove',
          'touchstart',
          'touchend'
        ],
        event => {
          if ((event.target as HTMLElement).nodeName?.toLowerCase() !== 'html') {
            hadKeyboardEventRef.current = false;
            eventSubscription.pause();
          }
        }
      ),
    [hadKeyboardEventRef]
  );

  const setHasFocusVisible = useCallback(
    nextHasFocusVisible => {
      if (hasFocusVisibleRef.current !== nextHasFocusVisible) {
        hasFocusVisibleRef.current = nextHasFocusVisible;
        nextHasFocusVisible && onFocusVisibleRef?.current();
      }
    },
    [hasFocusVisibleRef, onFocusVisibleRef]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
      }

      if (event.target === targetRef.current) {
        setHasFocusVisible(true);
      }

      hadKeyboardEventRef.current = true;
    },
    [hadKeyboardEventRef, setHasFocusVisible, targetRef]
  );

  const handlePointerDown = useCallback(() => {
    hadKeyboardEventRef.current = false;
  }, [hadKeyboardEventRef]);

  const handleFocus = useCallback(
    ({ target }: Event) => {
      target === targetRef.current &&
        (hadKeyboardEventRef.current || focusTriggersKeyboardModality(target as HTMLInputElement)) &&
        setHasFocusVisible(true);
    },
    [hadKeyboardEventRef, setHasFocusVisible, targetRef]
  );

  const handleBlur = useCallback(
    (event: Event) => {
      if (event.target === targetRef.current && hasFocusVisibleRef.current) {
        blurSinceRef.current = Date.now();

        setHasFocusVisible(false);
      }
    },
    [blurSinceRef, Date, hasFocusVisibleRef, setHasFocusVisible, targetRef]
  );

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === 'hidden') {
      // The element is blurred due to "visibilityState" set to "hidden".
      // 100ms is referenced from the WICG polyfill.
      // eslint-disable-next-line no-magic-numbers
      if (Date.now() - blurSinceRef.current < 100) {
        hadKeyboardEventRef.current = true;
      }

      eventSubscription.resume();
    }
  }, [blurSinceRef, Date, eventSubscription, hadKeyboardEventRef]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('mousedown', handlePointerDown, true);
    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('touchstart', handlePointerDown, true);
    document.addEventListener('visibilitychange', handleVisibilityChange, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleKeyDown, handlePointerDown, handleVisibilityChange]);

  useEffect(() => {
    const { current: target } = targetRef;

    target.addEventListener('blur', handleBlur, true);
    target.addEventListener('focus', handleFocus, true);

    return () => {
      target.removeEventListener('blur', handleBlur);
      target.removeEventListener('focus', handleFocus);
    };

    // We specifically add "targetRef.current" here.
    // If the target element changed, we should reattach our event listeners.
  }, [handleBlur, handleFocus, targetRef]);

  useEffect(() => {
    eventSubscription.resume();

    return () => eventSubscription.pause();
  }, [eventSubscription]);
}

function useObserveFocusVisibleForModernBrowsers(
  targetRef: RefObject<HTMLElement>,
  onFocusVisibleRef: MutableRefObject<() => void>
) {
  const handleFocus = useCallback(() => {
    const { current } = targetRef;

    if (
      // "msMatchesSelector" is vendor-prefixed version of "matches".
      // eslint-disable-next-line dot-notation
      (current.matches || (current['msMatchesSelector'] as (selector: string) => boolean)).call(
        current,
        ':focus-visible'
      )
    ) {
      onFocusVisibleRef?.current();
    }
  }, [onFocusVisibleRef, targetRef]);

  useEffect(() => {
    const { current: target } = targetRef;

    target.addEventListener('focus', handleFocus);

    return () => target.removeEventListener('focus', handleFocus);

    // We specifically add "targetRef.current" here.
    // If the target element changed, we should reattach our event listeners.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleFocus, targetRef, targetRef.current]);
}

export default function useObserveFocusVisible(targetRef: RefObject<HTMLElement>, onFocusVisible: () => void) {
  const [nonce] = useNonce();
  const onFocusVisibleRef = useValueRef(onFocusVisible);

  // The nonce is use for browser capabilities. Just in case the "nonce" had changed unexpectedly, the capabilities of the browser should never change.
  // Thus, we are using an initial version of "nonce". In case web devs changed the "nonce" to an invalid value, we won't break rules of hooks (as stated below).
  const nonceRef = useRef(nonce);

  // ":focus-visible" selector is supported from Chrome/Edge 86+ and not supported in IE11 or Safari.
  // Doing a capability check on pseudo classes requires injecting a stylesheet, thus nonce is needed.
  const supportFocusVisible = useMemo(() => supportPseudoClass(':focus-visible', nonceRef.current), [nonceRef]);

  // Since "supportPseudoClass" is a browser capability, the result should be constant during the page lifetime.
  // Thus, running hooks conditionally is okay here.
  if (supportFocusVisible) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useObserveFocusVisibleForModernBrowsers(targetRef, onFocusVisibleRef);
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useObserveFocusVisibleForLegacyBrowsers(targetRef, onFocusVisibleRef);
  }
}
