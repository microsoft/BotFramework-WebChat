/* eslint react/no-array-index-key: "off" */

import { Components, connectToWebChat } from 'botframework-webchat-component';
import memoize from 'memoize-one';
import PropTypes from 'prop-types';
import React from 'react';

import { AdaptiveCardBuilder } from './AdaptiveCardBuilder';
import CommonCard from './CommonCard';

const { ImageContent, VideoContent } = Components;

class AnimationCardAttachment extends React.Component {
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
    const { adaptiveCards, attachment, attachment: { content: { media = [] } = {} } = {}, styleSet } = this.props;

    return (
      <div className={styleSet.animationCardAttachment}>
        <ul className="media-list">
          {media.map(({ profile = '', url }, index) => (
            <li key={index}>
              {/\.gif$/iu.test(url) ? (
                <ImageContent alt={profile} src={url} />
              ) : (
                <VideoContent alt={profile} src={url} />
              )}
            </li>
          ))}
        </ul>
        <CommonCard adaptiveCards={adaptiveCards} attachment={attachment} />
      </div>
    );
  }
}

AnimationCardAttachment.propTypes = {
  adaptiveCards: PropTypes.any.isRequired,
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      media: PropTypes.arrayOf(
        PropTypes.shape({
          profile: PropTypes.string,
          url: PropTypes.string.isRequired
        })
      ).isRequired
    }).isRequired
  }).isRequired,
  styleSet: PropTypes.shape({
    animationCardAttachment: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(AnimationCardAttachment);
