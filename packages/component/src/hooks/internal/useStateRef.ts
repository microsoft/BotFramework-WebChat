import { Dispatch, MutableRefObject, SetStateAction, useCallback, useRef, useState } from 'react';

export default function useStateRef<T>(initialValue?: T): [T, Dispatch<SetStateAction<T>>, MutableRefObject<T>] {
  const [_, forceRender] = useState<{}>();
  const valueRef: MutableRefObject<T> = useRef<T>(initialValue);

  const setter: Dispatch<SetStateAction<T>> = useCallback(
    (value: SetStateAction<T>) => {
      const { current } = valueRef;
      let nextValue: T;

      if (value instanceof Function) {
        nextValue = value(current);
      } else {
        nextValue = value;
      }

      if (current !== nextValue) {
        valueRef.current = nextValue;

        forceRender({});
      }
    },
    [forceRender, valueRef]
  );

  return [valueRef.current, setter, valueRef];
}
