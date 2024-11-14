import { useMemo, RefObject, useRef, useCallback, DependencyList } from 'react';

export type UpdateFn = () => any;
export type OnTrackFn = (cb: UpdateFn) => () => boolean;

export function useUpdater<T>(fn: () => T, deps: DependencyList | undefined): Readonly<[RefObject<T>, OnTrackFn]> {
  const updaters = useRef<Set<UpdateFn>>(new Set());

  const onTrack = useCallback<OnTrackFn>((cb: UpdateFn) => {
    updaters.current.add(cb);
    return () => updaters.current.delete(cb);
  }, []);

  const ref = useRef<T>();

  useMemo(() => {
    ref.current = fn();
    for (const updater of updaters.current.values()) {
      updater();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fn, ...deps]);

  return useMemo(() => Object.freeze([ref, onTrack]), [ref, onTrack]);
}
