import { useCallback, type Dispatch, type SetStateAction } from 'react';

export default function useReadonlyState<T>(state: readonly [T, Dispatch<SetStateAction<T>>]): () => readonly [T] {
  const [value] = state;

  return useCallback(() => Object.freeze([value]), [value]);
}
