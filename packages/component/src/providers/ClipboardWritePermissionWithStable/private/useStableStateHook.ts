import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { createPropagation } from 'use-propagate';
import { useRefFrom } from 'use-ref-from';

import useRefWithInit from './useRefWithInit';

export default function useStableStateHook<T>(value: T): () => readonly [T];

export default function useStableStateHook<T>(
  value: T,
  setValue: Dispatch<SetStateAction<T>>
): () => readonly [T, Dispatch<SetStateAction<T>>];

export default function useStableStateHook<T>(
  value: T,
  setValue?: Dispatch<SetStateAction<T>> | undefined
): () => readonly [T, Dispatch<SetStateAction<T>>] | readonly [T] {
  const {
    current: { usePropagate, useListen }
  } = useRefWithInit<ReturnType<typeof createPropagation<T>>>(() => createPropagation<T>());
  const valueRef = useRefFrom(value);

  const propagate = usePropagate();

  useEffect(() => propagate(value), [propagate, value]);

  // Hack around ESLint rules without disabling react-hooks/rules-of-hooks.
  const _useListen = useListen;
  const _useMemo = useMemo;
  const _useState = useState;

  return useCallback(() => {
    const [propagatedValue, setPropagatedValue] = _useState<T>(valueRef.current);

    _useListen(setPropagatedValue);

    return _useMemo(
      () => Object.freeze(setValue ? ([propagatedValue, setValue] as const) : ([propagatedValue] as const)),
      // This deps is not checked by ESLint, verify with care.
      [propagatedValue, setValue]
    );
  }, [_useMemo, _useListen, _useState, setValue, valueRef]);
}
