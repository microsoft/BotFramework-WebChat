/* eslint react/no-array-index-key: "off" */

import { Components, connectToWebChat } from 'botframework-webchat-component';
import PropTypes from 'prop-types';
import React from 'react';

import CommonCard from './CommonCard';

const { ImageContent, VideoContent } = Components;

const AnimationCardAttachment = ({
  adaptiveCardHostConfig,
  adaptiveCards,
  attachment,
  attachment: { content: { media = [] } } = {},
  styleSet
}) => (
  <div className={styleSet.animationCardAttachment}>
    <ul className="media-list">
      {media.map(({ profile = '', url }, index) => (
        <li key={index}>
          {/\.gif$/iu.test(url) ? <ImageContent alt={profile} src={url} /> : <VideoContent alt={profile} src={url} />}
        </li>
      ))}
    </ul>
    <CommonCard adaptiveCardHostConfig={adaptiveCardHostConfig} adaptiveCards={adaptiveCards} attachment={attachment} />
  </div>
);

AnimationCardAttachment.propTypes = {
  adaptiveCardHostConfig: PropTypes.any.isRequired,
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
    animationCardAttachment: PropTypes.any.isRequired,
    options: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(AnimationCardAttachment);
