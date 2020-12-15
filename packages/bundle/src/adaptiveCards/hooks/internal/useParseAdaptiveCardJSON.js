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

  const { AdaptiveCard, SerializationContext } = adaptiveCardsPackage;

  return useCallback(
    (content, { ignoreErrors = false } = {}) => {
      if (!content) {
        return;
      }

      const card = new AdaptiveCard();
      const errors = [];
      const serializationContext = new SerializationContext();

      card.parse(content, serializationContext);

      const { eventCount } = serializationContext;

      for (let i = 0; i < eventCount; i++) {
        errors.push(serializationContext.getEventAt(i));
      }

      if (!ignoreErrors && errors.length) {
        console.error('botframework-webchat: Failed to parse Adaptive Card', { errors });

        throw new Error('botframework-webchat: Failed to parse Adaptive Card');
      }

      updateRTLInline(card, direction === 'rtl', adaptiveCardsPackage);

      return card;
    },
    [AdaptiveCard, adaptiveCardsPackage, direction, SerializationContext]
  );
}
