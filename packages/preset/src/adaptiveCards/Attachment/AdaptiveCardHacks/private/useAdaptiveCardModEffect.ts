import { useCallback, useEffect, useMemo, useRef } from 'react';

import useLazyRef from './useLazyRef';
import useValueRef from './useValueRef';

import type { AdaptiveCard } from 'adaptivecards';

type ModFunction<TArgs extends unknown[] = []> = (
  adaptiveCard: AdaptiveCard,
  cardElement: HTMLElement,
  ...args: TArgs
) => () => void;

class Mod<TArgs extends unknown[]> {
  constructor(mod: ModFunction<TArgs>) {
    this.#mod = mod;
  }

  // @ts-ignore We are using Babel to transpile and it will transpile private modifier.
  #mod: ModFunction<TArgs>;
  // @ts-ignore We are using Babel to transpile and it will transpile private modifier.
  #undo: (() => void) | undefined;

  apply(adaptiveCard: AdaptiveCard | undefined, cardElement: HTMLElement | undefined, ...args: TArgs) {
    this.#undo?.();
    this.#undo = adaptiveCard && cardElement && this.#mod(adaptiveCard, cardElement, ...args);
  }

  undo() {
    this.#undo?.();
    this.#undo = undefined;
  }
}

/**
 * Creates a mod effect for Adaptive Card.
 *
 * When this hook is executed, it will return two functions for applying and undo the mod.
 * It will also monitor the DOM tree and undo-then-reapply if mutation occurred.
 *
 * The first function must be called right after DOM is mounted. The second function must be called right before re-render.
 *
 * @return {[function, function]} Two functions, the first one to apply the mod, the second one to undo the mod.
 */
export default function useAdaptiveCardModEffect<TArgs extends unknown[]>(
  modder: (adaptiveCard: AdaptiveCard, cardElement: HTMLElement, ...args: TArgs) => () => void,
  adaptiveCard: AdaptiveCard
): readonly [(cardElement: HTMLElement, ...args: TArgs) => void, () => void] {
  const adaptiveCardRef = useValueRef(adaptiveCard);
  const mod = useMemo(() => new Mod<TArgs>(modder), [modder]);
  const reapplyRef = useRef<() => void>();

  const observerRef = useLazyRef<MutationObserver>(
    () =>
      new MutationObserver(() => {
        reapplyRef.current?.();
      })
  );

  useEffect(
    () => () => {
      observerRef.current.disconnect();
    },
    [observerRef]
  );

  const handleApply = useCallback(
    (cardElement: HTMLElement, ...args: TArgs) => {
      if (adaptiveCardRef.current && cardElement) {
        // Apply the mod immediately, then assign the function to reapply() so we can call later when mutation happens.
        (reapplyRef.current = () => mod.apply(adaptiveCardRef.current, cardElement, ...args))();
      }

      const { current: observer } = observerRef;

      observer.disconnect();
      observer.observe(cardElement, { childList: true, subtree: true });
    },
    [adaptiveCardRef, observerRef, mod]
  );

  const handleUndo = useCallback(() => {
    mod.undo();

    // If we have undo-ed the mod, calling reapply() through MutationObserver should be no-op.
    reapplyRef.current = undefined;
  }, [mod, reapplyRef]);

  return useMemo(
    () => Object.freeze([handleApply, handleUndo]) as readonly [typeof handleApply, typeof handleUndo],
    [handleApply, handleUndo]
  );
}
