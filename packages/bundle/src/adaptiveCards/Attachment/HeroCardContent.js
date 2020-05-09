import { hooks } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';

const { useDirection, useStyleOptions } = hooks;

const HeroCardContent = ({ content, disabled }) => {
  const [adaptiveCardsPackage] = useAdaptiveCardsPackage();
  const [styleOptions] = useStyleOptions();
  const [direction] = useDirection();
  const builtCard = useMemo(() => {
    const builder = new AdaptiveCardBuilder(adaptiveCardsPackage, styleOptions, direction);

    if (content) {
      (content.images || []).forEach(image => builder.addImage(image.url, null, image.tap));

      builder.addCommon(content);

      return builder.card;
    }
  }, [adaptiveCardsPackage, content, direction, styleOptions]);

  return <AdaptiveCardRenderer adaptiveCard={builtCard} disabled={disabled} tapAction={content && content.tap} />;
};

HeroCardContent.defaultProps = {
  disabled: undefined
};

HeroCardContent.propTypes = {
  content: PropTypes.shape({
    tap: PropTypes.any
  }).isRequired,
  disabled: PropTypes.bool
};

export default HeroCardContent;
