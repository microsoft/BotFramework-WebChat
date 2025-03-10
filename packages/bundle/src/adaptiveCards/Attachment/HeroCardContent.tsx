import { hooks } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { FC, useMemo } from 'react';
import type { DirectLineHeroCard } from 'botframework-webchat-core';

import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';
import useStyleOptions from '../../hooks/useStyleOptions';

const { useDirection } = hooks;

type HeroCardContentProps = {
  actionPerformedClassName?: string;
  content: DirectLineHeroCard;
  disabled?: boolean;
};

const HeroCardContent: FC<HeroCardContentProps> = ({ actionPerformedClassName, content, disabled }) => {
  const [adaptiveCardsPackage] = useAdaptiveCardsPackage();
  const [styleOptions] = useStyleOptions();
  const [direction] = useDirection();

  const builtCard = useMemo(() => {
    const builder = new AdaptiveCardBuilder(adaptiveCardsPackage, styleOptions, direction);

    if (content) {
      (content.images || []).forEach(image => builder.addImage(image.url, null, image.tap, image.alt));

      builder.addCommon(content);

      return builder.card;
    }
  }, [adaptiveCardsPackage, content, direction, styleOptions]);

  return (
    <AdaptiveCardRenderer
      actionPerformedClassName={actionPerformedClassName}
      adaptiveCard={builtCard}
      disabled={disabled}
      tapAction={content && content.tap}
    />
  );
};

HeroCardContent.defaultProps = {
  actionPerformedClassName: '',
  disabled: undefined
};

HeroCardContent.propTypes = {
  actionPerformedClassName: PropTypes.string,
  // PropTypes cannot fully capture TypeScript types.
  // @ts-ignore
  content: PropTypes.shape({
    images: PropTypes.arrayOf(
      PropTypes.shape({
        alt: PropTypes.string.isRequired,
        tap: PropTypes.any,
        url: PropTypes.string.isRequired
      })
    ),
    tap: PropTypes.any
  }).isRequired,
  disabled: PropTypes.bool
};

export default HeroCardContent;
