import { connectToWebChat } from 'botframework-webchat-component';
import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

const CommonCard = ({ adaptiveCardHostConfig, adaptiveCards, attachment: { content }, styleSet: { options } }) => {
  const buildCard = useMemo(() => {
    if (content) {
      const builder = new AdaptiveCardBuilder(adaptiveCards, options);

      builder.addCommon(content);

      return builder.card;
    }
  }, [adaptiveCards, content, options]);

  return (
    <AdaptiveCardRenderer
      adaptiveCard={buildCard}
      adaptiveCardHostConfig={adaptiveCardHostConfig}
      tapAction={content && content.tap}
    />
  );
};

CommonCard.propTypes = {
  adaptiveCardHostConfig: PropTypes.any.isRequired,
  adaptiveCards: PropTypes.any.isRequired,
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      tap: PropTypes.any
    }).isRequired
  }).isRequired,
  styleSet: PropTypes.any.isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(CommonCard);
