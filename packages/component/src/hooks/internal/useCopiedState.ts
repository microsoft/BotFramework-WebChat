import { type GlobalScopePonyfill } from 'botframework-webchat-core';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const COPIED_DURATION = 5_000;

/**
 * State of the "Copied" confirmation of a copy button: it is shown for 5 seconds after `markAsCopied()`, calling it again restarts the 5 seconds.
 *
 * The ponyfill is passed in, so copy buttons rendered outside of the React tree of Web Chat (custom elements) can use it.
 *
 * @returns A tuple of whether the confirmation should be shown, and the function to call after copying.
 */
export default function useCopiedState({
  clearTimeout,
  setTimeout
}: Pick<GlobalScopePonyfill, 'clearTimeout' | 'setTimeout'>): readonly [boolean, () => void] {
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>();

  const markAsCopied = useCallback(() => {
    copiedTimeoutRef.current && clearTimeout(copiedTimeoutRef.current);
    copiedTimeoutRef.current = setTimeout(() => setCopied(false), COPIED_DURATION);
    setCopied(true);
  }, [clearTimeout, copiedTimeoutRef, setCopied, setTimeout]);

  useEffect(
    () => () => copiedTimeoutRef.current && clearTimeout(copiedTimeoutRef.current),
    [clearTimeout, copiedTimeoutRef]
  );

  return useMemo(() => Object.freeze([copied, markAsCopied] as const), [copied, markAsCopied]);
}
