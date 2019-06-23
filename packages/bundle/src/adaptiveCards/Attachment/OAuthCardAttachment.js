import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import { connectToWebChat } from 'botframework-webchat-component';
import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';

class OAuthCardAttachment extends React.Component {
  constructor(props) {
    super(props);

    this.buildCard = memoize((adaptiveCards, content, styleOptions) => {
      const builder = new AdaptiveCardBuilder(adaptiveCards, styleOptions);

      builder.addCommonHeaders(content);
      builder.addButtons((content || {}).buttons, true);

      return builder.card;
    });
  }

  render() {
    const {
      props: {
        adaptiveCardHostConfig,
        adaptiveCards,
        attachment: { content } = {},
        styleSet: { options }
      }
    } = this;

    return (
      <AdaptiveCardRenderer
        adaptiveCard={content && this.buildCard(adaptiveCards, content, options)}
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
  }).isRequired,
  styleSet: PropTypes.shape({
    options: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(OAuthCardAttachment);
