import { useCallback, useRef, useState } from 'react';

export default function useStateWithOptimisticRef<T>(initialState: T | (() => T)) {
  const [state, setState] = useState(initialState);
  const stateRef = useRef<T>(state);

  const setStateWithRefUpdate = useCallback((newState: T) => {
    setState(newState);
    stateRef.current = newState;
  }, []);

  return [state, setStateWithRefUpdate, stateRef] as const;
}
