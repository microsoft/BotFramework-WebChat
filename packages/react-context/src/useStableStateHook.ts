import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { createPropagation } from 'use-propagate';
import { useRefFrom } from 'use-ref-from';

const useCreateHook = <T>(
  setValue: Dispatch<SetStateAction<T>> | undefined,
  useListen: (listener: (value: T) => void) => void,
  valueRef: Readonly<{ current: T }>
) => {
  const [propagatedValue, setPropagatedValue] = useState<T>(valueRef.current);

  useListen(setPropagatedValue);

  return useMemo(
    () => Object.freeze(setValue ? ([propagatedValue, setValue] as const) : ([propagatedValue] as const)),
    [propagatedValue, setValue]
  );
};

export default function useStableStateHook<T>(value: T): () => readonly [T];

export default function useStableStateHook<T>(
  value: T,
  setValue: Dispatch<SetStateAction<T>>
): () => readonly [T, Dispatch<SetStateAction<T>>];

export default function useStableStateHook<T>(
  value: T,
  setValue?: Dispatch<SetStateAction<T>> | undefined
): () => readonly [T, Dispatch<SetStateAction<T>>] | readonly [T] {
  const [{ usePropagate, useListen }] = useState(() => createPropagation<T>({ allowPropagateDuringRender: true }));
  const valueRef = useRefFrom(value);

  const propagate = usePropagate();

  useMemo(() => propagate(value), [propagate, value]);

  // Hack around ESLint rules without disabling react-hooks/rules-of-hooks.
  const _useCreateHook = useCreateHook;

  return useCallback(
    () => _useCreateHook(setValue, useListen, valueRef),
    [_useCreateHook, setValue, useListen, valueRef]
  );
}
