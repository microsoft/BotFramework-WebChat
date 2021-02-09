import { useRef } from 'react';

export default function useChanged(value) {
  const prevValueRef = useRef(value);
  const changed = value !== prevValueRef.current;

  prevValueRef.current = value;

  return changed;
}
