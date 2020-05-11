import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';

import { hooks } from 'botframework-webchat-component';

const { useDirection } = hooks;

function stripSubmitAction(card) {
  if (!card.actions) {
    return card;
  }

  // Filter out HTTP action buttons
  const nextActions = card.actions
    .filter(action => action.type !== 'Action.Submit')
    .map(action => (action.type === 'Action.ShowCard' ? { ...action, card: stripSubmitAction(action.card) } : action));

  return { ...card, nextActions };
}

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

const AdaptiveCardContent = ({ actionPerformedClassName, content, disabled }) => {
  const [adaptiveCardsPackage] = useAdaptiveCardsPackage();
  const { AdaptiveCard } = adaptiveCardsPackage;
  const [direction] = useDirection();
  const { card } = useMemo(() => {
    if (content) {
      const card = new AdaptiveCard();
      const errors = [];

      // TODO: [P3] Move from "onParseError" to "card.parse(json, errors)"
      AdaptiveCard.onParseError = error => errors.push(error);

      card.parse(
        stripSubmitAction({
          version: '1.0',
          ...(typeof content === 'object' ? content : {})
        })
      );

      // Add rtl to Adaptive Card and child elements if Web Chat direction is 'rtl'
      updateRTLInline(card, direction === 'rtl', adaptiveCardsPackage);

      AdaptiveCard.onParseError = null;

      return {
        card,
        errors
      };
    }

    return {};
  }, [AdaptiveCard, adaptiveCardsPackage, content, direction]);

  return (
    !!card && (
      <AdaptiveCardRenderer
        actionPerformedClassName={actionPerformedClassName}
        adaptiveCard={card}
        disabled={disabled}
      />
    )
  );
};

AdaptiveCardContent.defaultProps = {
  actionPerformedClassName: '',
  disabled: undefined
};

AdaptiveCardContent.propTypes = {
  actionPerformedClassName: PropTypes.string,
  content: PropTypes.any.isRequired,
  disabled: PropTypes.bool
};

export default AdaptiveCardContent;
