import { type GlobalScopePonyfill } from 'botframework-webchat-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRefFrom } from 'use-ref-from';

/**
 * Like `useState()`, but the value is reset to `initialValue` after `resetIntervalInMS` milliseconds.
 *
 * Setting the value again restarts the interval.
 *
 * The ponyfill is passed in, so components rendered outside of the React tree of Web Chat (custom elements) can use it.
 *
 * @returns A tuple of the current value, and the function to set it.
 */
export default function useAutoResetState<T>(
  initialValue: T,
  resetIntervalInMS: number,
  { clearTimeout, setTimeout }: Pick<GlobalScopePonyfill, 'clearTimeout' | 'setTimeout'>
): readonly [T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const initialValueRef = useRefFrom(initialValue);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  // Values are wrapped in functions, so a function value is not called as a state updater.
  const setValueWithAutoReset = useCallback(
    (nextValue: T) => {
      resetTimeoutRef.current && clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = setTimeout(() => setValue(() => initialValueRef.current), resetIntervalInMS);
      setValue(() => nextValue);
    },
    [clearTimeout, initialValueRef, resetIntervalInMS, resetTimeoutRef, setTimeout, setValue]
  );

  useEffect(
    () => () => resetTimeoutRef.current && clearTimeout(resetTimeoutRef.current),
    [clearTimeout, resetTimeoutRef]
  );

  return useMemo(() => Object.freeze([value, setValueWithAutoReset] as const), [setValueWithAutoReset, value]);
}
