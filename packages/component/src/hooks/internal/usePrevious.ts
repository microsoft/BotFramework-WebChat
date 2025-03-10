// TODO: [P0] #4133 Don't copy.
import { useEffect, useRef } from 'react';

export default function usePrevious<T>(value: T): T {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  });

  return ref.current;
}
