import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

export default class OAuthCardAttachment extends React.Component {
  constructor(props) {
    super(props);

    this.buildCard = memoize((adaptiveCards, content) => {
      const builder = new AdaptiveCardBuilder(adaptiveCards);

      builder.addCommonHeaders(content);
      builder.addButtons((content || {}).buttons, true);

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
      />
    );
  }
}

OAuthCardAttachment.propTypes = {
  adaptiveCardHostConfig: PropTypes.any.isRequired,
  adaptiveCards: PropTypes.any.isRequired,
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      buttons: PropTypes.array
    }).isRequired
  }).isRequired
};
