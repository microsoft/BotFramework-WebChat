import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import AdaptiveCardRenderer from './AdaptiveCardRenderer';

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

const AdaptiveCardAttachment = ({ adaptiveCardHostConfig, adaptiveCards, attachment: { content }, renderMarkdown }) => {
  const { card } = useMemo(() => {
    if (content) {
      const card = new adaptiveCards.AdaptiveCard();
      const errors = [];

      // TODO: [P3] Move from "onParseError" to "card.parse(json, errors)"
      adaptiveCards.AdaptiveCard.onParseError = error => errors.push(error);

      card.parse(
        stripSubmitAction({
          version: '1.0',
          ...content
        })
      );

      adaptiveCards.AdaptiveCard.onParseError = null;

      return {
        card,
        errors
      };
    }
  }, [adaptiveCards, content]);

  return (
    <AdaptiveCardRenderer
      adaptiveCard={card}
      adaptiveCardHostConfig={adaptiveCardHostConfig}
      renderMarkdown={renderMarkdown}
    />
  );
};

export default AdaptiveCardAttachment;

AdaptiveCardAttachment.propTypes = {
  // TODO: [P2] We should rename adaptiveCards to adaptiveCardsPolyfill
  adaptiveCardHostConfig: PropTypes.any.isRequired,
  adaptiveCards: PropTypes.any.isRequired,
  attachment: PropTypes.shape({
    content: PropTypes.any.isRequired
  }).isRequired,
  renderMarkdown: PropTypes.any.isRequired
};
