/* eslint no-magic-numbers: ["error", { "ignore": [25, 75] }] */

import PropTypes from 'prop-types';
import React, { useMemo } from 'react';

import { hooks } from 'botframework-webchat-component';

import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import useAdaptiveCardsPackage from '../hooks/useAdaptiveCardsPackage';

const { useStyleOptions } = hooks;

const ThumbnailCardAttachment = ({ attachment: { content } = {} }) => {
  const [adaptiveCardsPackage] = useAdaptiveCardsPackage();
  const [styleOptions] = useStyleOptions();
  const builtCard = useMemo(() => {
    if (content) {
      const builder = new AdaptiveCardBuilder(adaptiveCardsPackage, styleOptions);
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
  }, [adaptiveCardsPackage, content, styleOptions]);

  return <AdaptiveCardRenderer adaptiveCard={builtCard} tapAction={content && content.tap} />;
};

ThumbnailCardAttachment.propTypes = {
  attachment: PropTypes.shape({
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
    }).isRequired
  }).isRequired
};

export default ThumbnailCardAttachment;
