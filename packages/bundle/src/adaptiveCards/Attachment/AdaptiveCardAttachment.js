import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';

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

const AdaptiveCardAttachment = ({ attachment: { content } }) => {
  const [{ AdaptiveCard }] = useAdaptiveCardsPackage();
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

      AdaptiveCard.onParseError = null;

      return {
        card,
        errors
      };
    }

    return {};
  }, [AdaptiveCard, content]);

  return !!card && <AdaptiveCardRenderer adaptiveCard={card} />;
};

export default AdaptiveCardAttachment;

AdaptiveCardAttachment.propTypes = {
  attachment: PropTypes.shape({
    content: PropTypes.any.isRequired
  }).isRequired
};
