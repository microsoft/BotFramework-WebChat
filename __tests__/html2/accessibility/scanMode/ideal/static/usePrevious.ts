import { useEffect, useRef } from 'react';

export default function usePrevious<T>(value: T): T | undefined {
  const previousRef = useRef<T>();

  useEffect(() => {
    previousRef.current = value;
  });

  return previousRef.current;
}
