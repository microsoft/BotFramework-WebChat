import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { connectToWebChat } from 'botframework-webchat-component';
import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

const OAuthCardAttachment = ({
  adaptiveCardHostConfig,
  adaptiveCards,
  attachment: { content } = {},
  styleSet: { options }
}) => {
  const builtCard = useMemo(() => {
    if (content) {
      const builder = new AdaptiveCardBuilder(adaptiveCards, options);

      builder.addCommonHeaders(content);
      builder.addButtons((content || {}).buttons, true);

      return builder.card;
    }
  }, [adaptiveCards, content, options]);

  return <AdaptiveCardRenderer adaptiveCard={builtCard} adaptiveCardHostConfig={adaptiveCardHostConfig} />;
};

OAuthCardAttachment.propTypes = {
  adaptiveCardHostConfig: PropTypes.any.isRequired,
  adaptiveCards: PropTypes.any.isRequired,
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      buttons: PropTypes.array
    }).isRequired
  }).isRequired,
  styleSet: PropTypes.shape({
    options: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(OAuthCardAttachment);
