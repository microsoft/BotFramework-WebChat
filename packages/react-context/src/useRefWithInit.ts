import { useRef } from 'react';

// useRef() does not support init function like useMemo().
export default function useRefWithInit<T>(fn: () => T): ReturnType<typeof useRef<T>> {
  const initializedRef = useRef(false);
  const ref = useRef<T>();

  if (!initializedRef.current) {
    ref.current = fn();
    initializedRef.current = true;
  }

  return ref;
}
