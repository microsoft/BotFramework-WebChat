/* eslint no-magic-numbers: ["error", { "ignore": [25, 75] }] */

import { hooks } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';

const { useDirection, useStyleOptions } = hooks;

const ThumbnailCardContent = ({ actionPerformedClassName, content, disabled }) => {
  const [adaptiveCardsPackage] = useAdaptiveCardsPackage();
  const [direction] = useDirection();
  const [styleOptions] = useStyleOptions();
  const builtCard = useMemo(() => {
    if (content) {
      const builder = new AdaptiveCardBuilder(adaptiveCardsPackage, styleOptions, direction);
      const { TextSize, TextWeight } = adaptiveCardsPackage;
      const { buttons, images, subtitle, text, title } = content;
      const { richCardWrapTitle } = styleOptions;

      if (images && images.length) {
        const [firstColumn, lastColumn] = builder.addColumnSet([75, 25]);
        const [{ tap, url }] = images;

        builder.addTextBlock(
          title,
          { size: TextSize.Medium, weight: TextWeight.Bolder, wrap: richCardWrapTitle },
          firstColumn
        );

        builder.addTextBlock(subtitle, { isSubtle: true, wrap: richCardWrapTitle }, firstColumn);
        builder.addImage(url, lastColumn, tap);
        builder.addTextBlock(text, { wrap: true });
        builder.addButtons(buttons);
      } else {
        builder.addCommon(content);
      }
      return builder.card;
    }
  }, [adaptiveCardsPackage, direction, content, styleOptions]);

  return (
    <AdaptiveCardRenderer
      actionPerformedClassName={actionPerformedClassName}
      adaptiveCard={builtCard}
      disabled={disabled}
      tapAction={content && content.tap}
    />
  );
};

ThumbnailCardContent.defaultProps = {
  actionPerformedClassName: '',
  disabled: undefined
};

ThumbnailCardContent.propTypes = {
  actionPerformedClassName: PropTypes.string,
  content: PropTypes.shape({
    buttons: PropTypes.array,
    images: PropTypes.arrayOf(
      PropTypes.shape({
        tap: PropTypes.any,
        url: PropTypes.string.isRequired
      })
    ),
    subtitle: PropTypes.string,
    tap: PropTypes.any,
    text: PropTypes.string,
    title: PropTypes.string
  }).isRequired,
  disabled: PropTypes.bool
};

export default ThumbnailCardContent;
