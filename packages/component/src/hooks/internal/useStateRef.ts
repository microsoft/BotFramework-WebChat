import { Dispatch, RefObject, SetStateAction, useCallback, useRef, useState } from 'react';

export default function useStateRef<T>(initialState?: T): [T, Dispatch<SetStateAction<T>>, RefObject<T>] {
  const [value, setValue] = useState(initialState);
  const valueRef = useRef<T>();

  valueRef.current = value;

  const setValueWithRef = useCallback(
    nextState => {
      const nextValue = typeof nextState === 'function' ? (nextState as Function)(valueRef.current) : nextState;

      valueRef.current = nextValue;

      setValue(nextValue);
    },
    [setValue, valueRef]
  );

  return [value, setValueWithRef, valueRef];
}
