import { Dispatch, MutableRefObject, SetStateAction, useCallback, useRef, useState } from 'react';

export default function useStateRef<T>(initialValue?: T): [T, Dispatch<SetStateAction<T>>, MutableRefObject<T>] {
  const [_, forceRender] = useState<{}>();
  const valueRef: MutableRefObject<T> = useRef<T>(initialValue);

  const setter: Dispatch<SetStateAction<T>> = useCallback(
    (value: SetStateAction<T>) => {
      const { current } = valueRef;

      value = value instanceof Function ? value(current) : value;

      if (current !== value) {
        valueRef.current = value;

        forceRender({});
      }
    },
    [forceRender, valueRef]
  );

  return [valueRef.current, setter, valueRef];
}
