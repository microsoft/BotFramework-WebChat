import { useEffect, useRef } from 'react';

export default function usePrevious<T>(value: T): T | undefined;
export default function usePrevious<T>(value: T, initialValue: T): T;

export default function usePrevious<T>(value: T, initialValue?: T | undefined): T | undefined {
  const ref = useRef<T | undefined>(initialValue);

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
