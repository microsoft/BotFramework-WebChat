import { useRef } from 'react';

/**
 * Returns `true` if the `value` has changed, otherwise, `false`.
 *
 * Note: on initial call, this will return `true`.
 */
export default function useChanged<T>(value: T): boolean {
  const prevValueRef = useRef(value);
  const changed = value !== prevValueRef.current;

  prevValueRef.current = value;

  return changed;
}
