import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { hooks } from 'botframework-webchat-component';
import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

import useAdaptiveCardsPackage from '../../hooks/useAdaptiveCardsPackage';

const { useStyleOptions } = hooks;

const CommonCard = ({ attachment: { content } }) => {
  const [adaptiveCards] = useAdaptiveCardsPackage();
  const [styleOptions] = useStyleOptions();

  const builtCard = useMemo(() => {
    if (content) {
      const builder = new AdaptiveCardBuilder(adaptiveCards, styleOptions);

      builder.addCommon(content);

      return builder.card;
    }
  }, [adaptiveCards, content, styleOptions]);

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
