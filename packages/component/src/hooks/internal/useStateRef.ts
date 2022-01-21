import { useCallback, useRef, useState } from 'react';

import type { Dispatch, MutableRefObject, SetStateAction } from 'react';

export default function useStateRef<T>(
  initialValue?: T
): readonly [T, Dispatch<SetStateAction<T>>, MutableRefObject<T>] {
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

  return Object.freeze([valueRef.current, setter, valueRef]) as readonly [
    T,
    Dispatch<SetStateAction<T>>,
    MutableRefObject<T>
  ];
}
