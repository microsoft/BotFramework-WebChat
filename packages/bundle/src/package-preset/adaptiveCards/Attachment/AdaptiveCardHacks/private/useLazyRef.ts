import { useRef } from 'react';

import type { MutableRefObject } from 'react';

const UNINITIALIZED = Symbol();

export default function useLazyRef<T>(refInit: () => T): MutableRefObject<T> {
  const ref = useRef<T | typeof UNINITIALIZED>(UNINITIALIZED);

  if (ref.current === UNINITIALIZED) {
    ref.current = refInit();
  }

  return ref as MutableRefObject<T>;
}
