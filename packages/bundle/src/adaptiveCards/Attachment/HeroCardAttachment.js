import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

export default class HeroCardAttachment extends React.Component {
  constructor(props) {
    super(props);

    this.buildCard = memoize((adaptiveCards, content) => {
      const builder = new AdaptiveCardBuilder(adaptiveCards);

      (content.images || []).forEach(image => builder.addImage(image.url, null, image.tap));

      builder.addCommon(content);

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

HeroCardAttachment.propTypes = {
  adaptiveCardHostConfig: PropTypes.any.isRequired,
  adaptiveCards: PropTypes.any.isRequired,
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      tap: PropTypes.any
    }).isRequired
  }).isRequired
};
