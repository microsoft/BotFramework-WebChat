import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { hooks } from 'botframework-webchat-component';
import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

const { useStyleOptions } = hooks;

const HeroCardAttachment = ({ adaptiveCardHostConfig, adaptiveCards, attachment: { content } = {} }) => {
  const [styleOptions] = useStyleOptions();
  const builtCard = useMemo(() => {
    const builder = new AdaptiveCardBuilder(adaptiveCards, styleOptions);

    if (content) {
      (content.images || []).forEach(image => builder.addImage(image.url, null, image.tap));

      builder.addCommon(content);

      return builder.card;
    }
  }, [adaptiveCards, content, styleOptions]);

  return (
    <AdaptiveCardRenderer
      adaptiveCard={builtCard}
      adaptiveCardHostConfig={adaptiveCardHostConfig}
      tapAction={content && content.tap}
    />
  );
};

HeroCardAttachment.propTypes = {
  adaptiveCardHostConfig: PropTypes.any.isRequired,
  adaptiveCards: PropTypes.any.isRequired,
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      tap: PropTypes.any
    }).isRequired
  }).isRequired,
  styleSet: PropTypes.shape({
    options: PropTypes.any.isRequired
  }).isRequired
};

export default HeroCardAttachment;
