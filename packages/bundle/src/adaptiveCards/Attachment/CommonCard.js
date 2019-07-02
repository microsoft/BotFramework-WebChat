import { connectToWebChat } from 'botframework-webchat-component';
import AdaptiveCardBuilder from './AdaptiveCardBuilder';
import AdaptiveCardRenderer from './AdaptiveCardRenderer';
import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

class CommonCard extends React.Component {
  constructor(props) {
    super(props);

    this.buildCard = memoize((adaptiveCards, content, styleOptions) => {
      const builder = new AdaptiveCardBuilder(adaptiveCards, styleOptions);

      builder.addCommon(content);

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
        tapAction={content && content.tap}
      />
    );
  }
}

CommonCard.propTypes = {
  adaptiveCardHostConfig: PropTypes.any.isRequired,
  adaptiveCards: PropTypes.any.isRequired,
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      tap: PropTypes.any
    }).isRequired
  }).isRequired,
  styleSet: PropTypes.any.isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(CommonCard);
