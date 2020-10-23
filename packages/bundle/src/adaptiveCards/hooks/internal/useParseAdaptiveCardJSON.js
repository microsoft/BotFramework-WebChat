import { hooks } from 'botframework-webchat-component';
import { useCallback } from 'react';

import useAdaptiveCardsPackage from '../useAdaptiveCardsPackage';

const { useDirection } = hooks;

function updateRTLInline(element, rtl, adaptiveCardsPackage) {
  if (element instanceof adaptiveCardsPackage.Container) {
    element.rtl = rtl;
  }

  // Tree traversal to add rtl boolean to child elements
  if (element.getItemAt && element.getItemCount) {
    const count = element.getItemCount();

    for (let index = 0; index < count; index++) {
      const child = element.getItemAt(index);

      updateRTLInline(child, rtl, adaptiveCardsPackage);
    }
  }
}

export default function useParseAdaptiveCardJSON() {
  const [adaptiveCardsPackage] = useAdaptiveCardsPackage();
  const [direction] = useDirection();

  const { AdaptiveCard } = adaptiveCardsPackage;

  return useCallback(
    (content, { ignoreErrors = false } = {}) => {
      if (!content) {
        return;
      }

      const card = new AdaptiveCard();
      const errors = [];

      // TODO: [P3] #3487 Move from "onParseError" to "card.parse(json, errors)"
      AdaptiveCard.onParseError = error => errors.push(error);

      card.parse(content);

      updateRTLInline(card, direction === 'rtl', adaptiveCardsPackage);

      AdaptiveCard.onParseError = null;

      if (!ignoreErrors && errors.length) {
        console.error('botframework-webchat: Failed to parse Adaptive Card', { errors });

        throw new Error('botframework-webchat: Failed to parse Adaptive Card');
      }

      return card;
    },
    [AdaptiveCard, adaptiveCardsPackage, direction]
  );
}
