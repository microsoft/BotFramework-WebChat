import { useMemo, useRef } from 'react';

import getInputValue from './private/getInputValue';
import setInputValue from './private/setInputValue';
import useAdaptiveCardModEffect from './private/useAdaptiveCardModEffect';
import usePrevious from './private/usePrevious';

import type { AdaptiveCard, CardObject } from 'adaptivecards';

/**
 * Re-rendering: Current user-inputted values must be saved and restored on re-render.
 */
export default function usePersistValuesModEffect(adaptiveCard: AdaptiveCard) {
  const prevAdaptiveCard = usePrevious(adaptiveCard);
  const valuesMapRef = useRef<Map<CardObject, boolean | string>>(new Map());

  prevAdaptiveCard === adaptiveCard || valuesMapRef.current.clear();

  const modder = useMemo(
    () => (adaptiveCard: AdaptiveCard) => {
      const { current: valuesMap } = valuesMapRef;

      adaptiveCard.getAllInputs().forEach(cardObject => {
        const { renderedElement } = cardObject;

        if (
          !(
            renderedElement instanceof HTMLInputElement ||
            renderedElement instanceof HTMLSelectElement ||
            renderedElement instanceof HTMLTextAreaElement
          ) ||
          !valuesMap.has(cardObject)
        ) {
          return;
        }

        setInputValue(renderedElement, valuesMap.get(cardObject));
      });

      return () => {
        valuesMapRef.current = adaptiveCard
          .getAllInputs()
          .reduce<Map<CardObject, boolean | string>>((valuesMap, cardObject) => {
            const { renderedElement } = cardObject;

            return renderedElement instanceof HTMLInputElement ||
              renderedElement instanceof HTMLSelectElement ||
              renderedElement instanceof HTMLTextAreaElement
              ? valuesMap.set(cardObject, getInputValue(renderedElement))
              : valuesMap;
          }, new Map());
      };
    },
    [valuesMapRef]
  );

  return useAdaptiveCardModEffect(modder, adaptiveCard);
}
