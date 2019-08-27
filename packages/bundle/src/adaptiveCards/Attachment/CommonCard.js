import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { useStyleSet } from 'botframework-webchat-component';
import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

const CommonCard = ({ adaptiveCardHostConfig, adaptiveCards, attachment: { content } }) => {
  const { options } = useStyleSet();
  const builtCard = useMemo(() => {
    if (content) {
      const builder = new AdaptiveCardBuilder(adaptiveCards, options);

      builder.addCommon(content);

      return builder.card;
    }
  }, [adaptiveCards, content, options]);

  return (
    <AdaptiveCardRenderer
      adaptiveCard={builtCard}
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
  }).isRequired
};

export default CommonCard;
