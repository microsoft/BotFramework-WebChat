/* eslint no-magic-numbers: ["error", { "ignore": [25, 75] }] */

import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

export default class ThumbnailCardAttachment extends React.Component {
  constructor(props) {
    super(props);

    this.buildCard = memoize((adaptiveCards, content) => {
      const builder = new AdaptiveCardBuilder(adaptiveCards);
      const { TextSize, TextWeight } = adaptiveCards;
      const { buttons, images, subtitle, text, title } = content;

      if (images && images.length) {
        const [firstColumn, lastColumn] = builder.addColumnSet([75, 25]);
        const [{ tap, url }] = images;

        builder.addTextBlock(title, { size: TextSize.Medium, weight: TextWeight.Bolder }, firstColumn);
        builder.addTextBlock(subtitle, { isSubtle: true, wrap: true }, firstColumn);
        builder.addImage(url, lastColumn, tap);
        builder.addTextBlock(text, { wrap: true });
        builder.addButtons(buttons);
      } else {
        builder.addCommon(content);
      }

      return builder.card;
    });
  }

  render() {
    const {
      props: { adaptiveCardHostConfig, adaptiveCards, attachment: { content } = {} }
    } = this;

    return (
      <AdaptiveCardRenderer
        adaptiveCard={content && this.buildCard(adaptiveCards, content)}
        adaptiveCardHostConfig={adaptiveCardHostConfig}
        tapAction={content && content.tap}
      />
    );
  }
}

ThumbnailCardAttachment.propTypes = {
  adaptiveCardHostConfig: PropTypes.any.isRequired,
  adaptiveCards: PropTypes.any.isRequired,
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
