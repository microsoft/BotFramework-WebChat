import { useMemo, useRef } from 'react';

import getInputValue from './private/getInputValue';
import setInputValue from './private/setInputValue';
import useAdaptiveCardModEffect from './private/useAdaptiveCardModEffect';
import usePrevious from './private/usePrevious';

import type { AdaptiveCard, CardObject } from 'adaptivecards';

const INPUT_ELEMENT_SELECTOR = 'input, select, textarea';

/**
 * Finds the actual input element rendered by the `CardObject`, such as `<input>`, `<select>`, or `<textarea`.
 *
 * The `CardObject.renderedElement` could be a `<div>` representing the container for the `CardObject`.
 *
 * @return {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | undefined} Returns the `<input>`, `<select>`, or `<textarea` rendered by the `CardObject`, otherwise, `undefined`.
 */
function getInputElement(
  cardObject: CardObject
): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | undefined {
  const { renderedElement } = cardObject;

  if (renderedElement) {
    if (renderedElement.matches(INPUT_ELEMENT_SELECTOR)) {
      return renderedElement as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    }

    return renderedElement.querySelector(INPUT_ELEMENT_SELECTOR);
  }
}

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
        const inputElement = getInputElement(cardObject);

        if (
          !(
            inputElement instanceof HTMLInputElement ||
            inputElement instanceof HTMLSelectElement ||
            inputElement instanceof HTMLTextAreaElement
          ) ||
          !valuesMap.has(cardObject)
        ) {
          return;
        }

        setInputValue(inputElement, valuesMap.get(cardObject));
      });

      return () => {
        valuesMapRef.current = adaptiveCard
          .getAllInputs()
          .reduce<Map<CardObject, boolean | string>>((valuesMap, cardObject) => {
            const inputElement = getInputElement(cardObject);

            return inputElement instanceof HTMLInputElement ||
              inputElement instanceof HTMLSelectElement ||
              inputElement instanceof HTMLTextAreaElement
              ? valuesMap.set(cardObject, getInputValue(inputElement))
              : valuesMap;
          }, new Map());
      };
    },
    [valuesMapRef]
  );

  return useAdaptiveCardModEffect(modder, adaptiveCard);
}
