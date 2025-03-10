import { useEffect, useMemo, useRef } from 'react';

import type { DependencyList } from 'react';

export default function useMemoWithPrevious<T>(factory: (prevValue: T) => T, deps: DependencyList): T {
  const prevValueRef = useRef<T>();
  // We are building a `useMemo`-like hook, `deps` is passed as-is and `factory` is not one fo the dependencies.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo<T>(() => factory(prevValueRef.current), deps);

  useEffect(() => {
    prevValueRef.current = value;
  });

  return value;
}
