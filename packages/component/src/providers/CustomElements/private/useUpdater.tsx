import { useMemo, RefObject, useRef, useCallback, DependencyList } from 'react';

export type UpdateFn = () => any;
export type OnTrackFn = (cb: UpdateFn, signal: AbortSignal) => void;

export function useUpdater<T>(fn: () => T, deps: DependencyList | undefined): Readonly<[RefObject<T>, OnTrackFn]> {
  const updaters = useRef<Set<UpdateFn>>(new Set());

  const onTrack = useCallback<OnTrackFn>((cb, signal) => {
    updaters.current.add(cb);
    signal.addEventListener('abort', () => updaters.current.delete(cb));
  }, []);

  const ref = useRef<T>();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const value = useMemo(fn, deps);

  if (ref.current !== value) {
    ref.current = value;
    for (const updater of updaters.current.values()) {
      updater();
    }
  }

  return useMemo(() => Object.freeze([ref, onTrack]), [ref, onTrack]);
}
