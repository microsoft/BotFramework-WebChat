import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
import { createPropagation } from 'use-propagate';
import { useRefFrom } from 'use-ref-from';

export default function useStableStateHook<T>(value: T): () => readonly [T];

export default function useStableStateHook<T>(
  value: T,
  setValue: Dispatch<SetStateAction<T>>
): () => readonly [T, Dispatch<SetStateAction<T>>];

export default function useStableStateHook<T>(
  value: T,
  setValue?: Dispatch<SetStateAction<T>> | undefined
): () => readonly [T, Dispatch<SetStateAction<T>>] | readonly [T] {
  const propagationRef = useRef<ReturnType<typeof createPropagation<T>>>();
  const valueRef = useRefFrom(value);

  if (!propagationRef.current) {
    propagationRef.current = createPropagation<T>();
  }

  const {
    current: { usePropagate, useListen }
  } = propagationRef;

  const propagate = usePropagate();

  useEffect(() => propagate(value), [propagate, value]);

  const useHook = () => {
    const [propagatedValue, setPropagatedValue] = useState<T>(valueRef.current);

    useListen(setPropagatedValue);

    return useMemo(
      () => Object.freeze(setValue ? ([propagatedValue, setValue] as const) : ([propagatedValue] as const)),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [propagatedValue, setValue]
    );
  };

  return useCallback(useHook, [useListen, setValue, valueRef]);
}
