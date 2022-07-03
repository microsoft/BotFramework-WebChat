import { useCallback, useEffect, useMemo, useRef } from 'react';

import useLazyRef from './private/useLazyRef';
import useValueRef from './private/useValueRef';

import type { AdaptiveCard } from 'adaptivecards';

class Mod {
  constructor(mod: (adaptiveCard: AdaptiveCard, cardElement: HTMLElement) => () => void) {
    this.#mod = mod;
  }

  // @ts-ignore We are using Babel to transpile and it will transpile private modifier.
  #mod: (adaptiveCard: AdaptiveCard, cardElement: HTMLElement) => () => void;
  // @ts-ignore We are using Babel to transpile and it will transpile private modifier.
  #undo: (() => void) | undefined;

  apply(adaptiveCard: AdaptiveCard | undefined, cardElement: HTMLElement | undefined) {
    this.#undo?.();
    this.#undo = adaptiveCard && cardElement && this.#mod(adaptiveCard, cardElement);
  }

  undo() {
    this.#undo?.();
    this.#undo = undefined;
  }
}

/**
 * Creates a mod effect for Adaptive Card.
 *
 * When this hook is executed, it will undo all current mods.
 * The returned function must be called as soon as the Adaptive Card element is mounted on the page.
 *
 * When the returned function is called, the mod will be applied.
 *
 * @return {function} A function, when called, will apply mods to the Adaptive Card element.
 */
export default function useAdaptiveCardModEffect(
  modder: (adaptiveCard: AdaptiveCard, cardElement: HTMLElement) => () => void,
  adaptiveCard: AdaptiveCard
): (cardElement: HTMLElement) => void {
  const adaptiveCardRef = useValueRef(adaptiveCard);
  const mod = useMemo(() => new Mod(modder), [modder]);
  const reapplyRef = useRef<() => void>();

  const modRef = useValueRef(mod);
  const observerRef = useLazyRef<MutationObserver>(() => new MutationObserver(() => reapplyRef.current?.()));

  reapplyRef.current = undefined;
  mod.undo();

  useEffect(
    () => () => {
      observerRef.current.disconnect();
    },
    [observerRef]
  );

  return useCallback(
    (cardElement: HTMLElement) => {
      if (adaptiveCardRef.current && cardElement) {
        // Apply the mod immediately, then assign the function to reapply() so we can call later when mutation happens.
        (reapplyRef.current = () => modRef.current.apply(adaptiveCardRef.current, cardElement))();
      }

      const { current: observer } = observerRef;

      observer.disconnect();
      observer.observe(cardElement, { childList: true, subtree: true });
    },
    [adaptiveCardRef, observerRef, modRef]
  );
}
