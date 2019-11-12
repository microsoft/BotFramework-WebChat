import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { hooks } from 'botframework-webchat-component';
import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

const { useStyleOptions } = hooks;

const OAuthCardAttachment = ({ adaptiveCardHostConfig, adaptiveCards, attachment: { content } = {} }) => {
  const [styleOptions] = useStyleOptions();

  const builtCard = useMemo(() => {
    if (content) {
      const builder = new AdaptiveCardBuilder(adaptiveCards, styleOptions);

      builder.addCommonHeaders(content);
      builder.addButtons((content || {}).buttons, true);

      return builder.card;
    }
  }, [adaptiveCards, content, styleOptions]);

  return <AdaptiveCardRenderer adaptiveCard={builtCard} adaptiveCardHostConfig={adaptiveCardHostConfig} />;
};

OAuthCardAttachment.propTypes = {
  adaptiveCardHostConfig: PropTypes.any.isRequired,
  adaptiveCards: PropTypes.any.isRequired,
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      buttons: PropTypes.array
    }).isRequired
  }).isRequired
};

export default OAuthCardAttachment;
