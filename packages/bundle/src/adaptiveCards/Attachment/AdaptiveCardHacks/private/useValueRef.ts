import { useRef } from 'react';

import type { RefObject } from 'react';

export default function useValueRef<T>(value: T): RefObject<T> {
  const ref = useRef<T>(value);

  ref.current = value;

  return ref;
}
