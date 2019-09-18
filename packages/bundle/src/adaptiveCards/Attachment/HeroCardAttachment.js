import { hooks } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

import useAdaptiveCardsPackage from '../../hooks/useAdaptiveCardsPackage';

const { useStyleOptions } = hooks;

const HeroCardAttachment = ({ attachment: { content } = {} }) => {
  const [adaptiveCards] = useAdaptiveCardsPackage();
  const [styleOptions] = useStyleOptions();

  const builtCard = useMemo(() => {
    const builder = new AdaptiveCardBuilder(adaptiveCards, styleOptions);

    if (content) {
      (content.images || []).forEach(image => builder.addImage(image.url, null, image.tap));

      builder.addCommon(content);

      return builder.card;
    }
  }, [adaptiveCards, content, styleOptions]);

  return <AdaptiveCardRenderer adaptiveCard={builtCard} tapAction={content && content.tap} />;
};

HeroCardAttachment.propTypes = {
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      tap: PropTypes.any
    }).isRequired
  }).isRequired
};

export default HeroCardAttachment;
