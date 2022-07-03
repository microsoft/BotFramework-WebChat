import { useMemo, useRef } from 'react';

import findDOMNodeOwner from './private/findDOMNodeOwner';
import useAdaptiveCardModEffect from './useAdaptiveCardModEffect';
import usePrevious from './private/usePrevious';

import { AdaptiveCard, CardObject } from 'adaptivecards';

function queryInputElements(cardElement: HTMLElement): (HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[] {
  return Array.from(
    cardElement.querySelectorAll('input, select, textarea') as NodeListOf<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  );
}

function getInputValue(inputElement: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement): boolean | string {
  const { type } = inputElement;

  if (inputElement.tagName === 'INPUT' && (type === 'checkbox' || type === 'radio')) {
    return (inputElement as HTMLInputElement).checked;
  }

  return inputElement.value;
}

function setInputValue(
  inputElement: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  value: boolean | string
): void {
  const { tagName, type } = inputElement;

  if (tagName === 'INPUT' && (type === 'checkbox' || type === 'radio')) {
    if (typeof value === 'boolean') {
      (inputElement as HTMLInputElement).checked = value;
    }
  } else if (typeof value === 'string') {
    inputElement.value = value;
  }
}

/**
 * When Adaptive Card is re-rendered, the current user-inputted values must be saved and restored on the new render.
 */
export default function usePersistValuesModEffect(adaptiveCard: AdaptiveCard) {
  const prevAdaptiveCard = usePrevious(adaptiveCard);
  const valuesMapRef = useRef<Map<CardObject, boolean | string>>(new Map());

  prevAdaptiveCard === adaptiveCard || valuesMapRef.current.clear();

  const modder = useMemo(
    () => (adaptiveCard: AdaptiveCard, cardElement: HTMLElement) => {
      const { current: valuesMap } = valuesMapRef;
      const inputtables: [HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement, CardObject][] = [];

      queryInputElements(cardElement).forEach(inputElement => {
        const cardObject = findDOMNodeOwner(adaptiveCard, inputElement);

        if (!cardObject) {
          return;
        }

        // Save all inputtables so we can retrieve it quicker in undo().
        inputtables.push([inputElement, cardObject]);

        if (!valuesMap.has(cardObject)) {
          return;
        }

        setInputValue(inputElement, valuesMap.get(cardObject) as boolean | string);
      });

      return () => {
        valuesMapRef.current = new Map(
          inputtables.map(([inputElement, cardObject]) => [cardObject, getInputValue(inputElement)])
        );
      };
    },
    [valuesMapRef]
  );

  return useAdaptiveCardModEffect(modder, adaptiveCard);
}
