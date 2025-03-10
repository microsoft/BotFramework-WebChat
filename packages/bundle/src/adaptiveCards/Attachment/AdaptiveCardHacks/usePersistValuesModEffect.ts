import { useMemo, useRef } from 'react';

import useAdaptiveCardModEffect from './private/useAdaptiveCardModEffect';
import usePrevious from './private/usePrevious';

import type { AdaptiveCard, CardObject } from 'adaptivecards';

/**
 * Gets all user-inputted values under a DOM node.
 *
 * We assume values are ID-ed. If not ID-ed (such as `<textarea>`), there will be only a single instance (no two `<textarea>`).
 */
function getUserValues(element: HTMLElement | undefined): Set<string> {
  if (!element) {
    return new Set();
  }

  return Array.from(
    element.querySelectorAll('input, option, textarea') as NodeListOf<
      HTMLInputElement | HTMLOptionElement | HTMLTextAreaElement
    >
  ).reduce<Set<string>>((values, element) => {
    if (element instanceof HTMLInputElement) {
      const { type } = element;

      if (type === 'checkbox' || type === 'radio') {
        element.checked && values.add(element.value);
      } else {
        // ASSUMPTION: We expect CardObject will NOT mix <input type="text"> with <input type="checkbox">.
        values.clear();
        values.add(element.value);
      }
    } else if (element instanceof HTMLOptionElement) {
      element.selected && values.add(element.value);
    } else {
      // ASSUMPTION: We expect CardObject will NOT mix <textarea> with <input type="checkbox">.
      values.clear();
      values.add(element.value);
    }

    return values;
  }, new Set());
}

/**
 * Set multiple user-inputted values under a DOM node.
 *
 * This function must be paired with `getUserValues`.
 */
function setUserValues(element: HTMLElement | undefined, values: Set<string>): void {
  if (!element) {
    return;
  }

  // If the element does not support multiple choices, say <input type="text"> or <textarea>, then, use the first value.
  const defaultValue = Array.from(values)[0] || '';

  (
    element.querySelectorAll('input, option, textarea') as NodeListOf<
      HTMLInputElement | HTMLOptionElement | HTMLTextAreaElement
    >
  ).forEach(element => {
    if (element instanceof HTMLInputElement) {
      const { type } = element;

      if (type === 'checkbox' || type === 'radio') {
        element.checked = values.has(element.value);
      } else {
        element.value = defaultValue;
      }
    } else if (element instanceof HTMLOptionElement) {
      element.selected = values.has(element.value);
    } else {
      element.value = defaultValue;
    }
  });
}

/**
 * Re-rendering: Current user-inputted values must be saved and restored on re-render.
 */
export default function usePersistValuesModEffect(adaptiveCard: AdaptiveCard) {
  const prevAdaptiveCard = usePrevious(adaptiveCard);
  const valuesMapRef = useRef<Map<CardObject, Set<string>>>(new Map());

  prevAdaptiveCard === adaptiveCard || valuesMapRef.current.clear();

  const modder = useMemo(
    () => (adaptiveCard: AdaptiveCard) => {
      const { current: valuesMap } = valuesMapRef;

      adaptiveCard.getAllInputs().forEach(cardObject => {
        valuesMap.has(cardObject) && setUserValues(cardObject.renderedElement, valuesMap.get(cardObject));
      });

      return () => {
        valuesMapRef.current = adaptiveCard
          .getAllInputs()
          .reduce<Map<CardObject, Set<string>>>((valuesMap, cardObject) => {
            const value = getUserValues(cardObject.renderedElement);

            return typeof value !== 'undefined' ? valuesMap.set(cardObject, value) : valuesMap;
          }, new Map());
      };
    },
    [valuesMapRef]
  );

  return useAdaptiveCardModEffect(modder, adaptiveCard);
}
