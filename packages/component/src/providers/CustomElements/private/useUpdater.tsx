import { useCallback, useMemo, useRef, type DependencyList } from 'react';

export function createElementRegistryWithUpdater<T extends Element = HTMLElement>() {
  type disposeFn = void | (() => void);
  type UpdateFn = (element: T) => disposeFn;

  class ElementUpdater<T> {
    element: any;
    #update: UpdateFn;
    #dispose: disposeFn;

    constructor(element: T, updateFn: UpdateFn) {
      this.element = element;
      this.#update = updateFn;
      this.update();
    }

    update() {
      this.dispose();
      this.#dispose = this.#update(this.element);
    }

    dispose() {
      this.#dispose && this.#dispose();
      this.#dispose = undefined;
    }

    eqUpdate(updateFn: UpdateFn) {
      return this.#update === updateFn;
    }
  }

  const updateCallbacks = new Set<UpdateFn>();
  const elements = new Set<T>();

  let updaters = new Set<ElementUpdater<T>>();

  function useUpdater(updateFn: UpdateFn, deps: DependencyList) {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const updateCallback = useCallback(updateFn, deps);

    const disposeCallback = useRef<() => void>();
    disposeCallback.current = useMemo(() => {
      disposeCallback.current?.();

      updateCallbacks.add(updateCallback);
      const localUpdaters = new Set([...elements].map(element => new ElementUpdater(element, updateCallback)));

      updaters = updaters.union(localUpdaters);

      return () => {
        updateCallbacks.delete(updateCallback);

        const disposeUpdaters = new Set([...updaters].filter(updater => updater.eqUpdate(updateCallback)));

        disposeUpdaters.forEach(updater => updater.dispose());

        updaters = updaters.difference(disposeUpdaters);
      };
    }, [updateCallback]);
  }

  function removeFromRegistry(element: T) {
    const disposeUpdaters = new Set([...updaters].filter(updater => updater.element === element));
    disposeUpdaters.forEach(updater => updater.dispose());
    updaters = updaters.difference(disposeUpdaters);
    elements.delete(element);
  }

  function addToRegistry(element: T) {
    if (elements.has(element)) {
      removeFromRegistry(element);
    }
    updaters = updaters.union(
      new Set([...updateCallbacks].map(updateCallback => new ElementUpdater(element, updateCallback)))
    );
    elements.add(element);
  }

  return [useUpdater, addToRegistry, removeFromRegistry] as const;
}
