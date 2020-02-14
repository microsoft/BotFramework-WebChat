import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { hooks } from 'botframework-webchat-component';

import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';

const { useDirection, useStyleOptions } = hooks;

const CommonCard = ({ attachment: { content } }) => {
  const [adaptiveCardsPackage] = useAdaptiveCardsPackage();
  const [direction] = useDirection();
  const [styleOptions] = useStyleOptions();

  const builtCard = useMemo(() => {
    if (content) {
      const builder = new AdaptiveCardBuilder(adaptiveCardsPackage, styleOptions, direction);

      builder.addCommon(content);

      return builder.card;
    }
  }, [adaptiveCardsPackage, content, direction, styleOptions]);

  return <AdaptiveCardRenderer adaptiveCard={builtCard} tapAction={content && content.tap} />;
};

CommonCard.propTypes = {
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      tap: PropTypes.any
    }).isRequired
  }).isRequired
};

export default CommonCard;
