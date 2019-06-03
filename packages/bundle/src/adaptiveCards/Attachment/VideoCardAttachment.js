/* eslint react/no-array-index-key: "off" */

import PropTypes from 'prop-types';
import React from 'react';

import { Components, connectToWebChat } from 'botframework-webchat-component';
import CommonCard from './CommonCard';

const { VideoContent } = Components;

const VideoCardAttachment = ({
  adaptiveCards,
  attachment,
  attachment: { content: { media, autostart, autoloop, image: { url: imageURL } = {} } = {} } = {},
  styleSet
}) => (
  <div className={styleSet.audioCardAttachment}>
    <ul className="media-list">
      {media.map(({ url }, index) => (
        <li key={index}>
          <VideoContent autoPlay={autostart} loop={autoloop} poster={imageURL} src={url} />
        </li>
      ))}
    </ul>
    <CommonCard adaptiveCards={adaptiveCards} attachment={attachment} />
  </div>
);

VideoCardAttachment.propTypes = {
  adaptiveCards: PropTypes.any.isRequired,
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      autoloop: PropTypes.bool,
      autostart: PropTypes.bool,
      image: PropTypes.shape({
        url: PropTypes.string
      }),
      media: PropTypes.arrayOf(
        PropTypes.shape({
          url: PropTypes.string
        })
      )
    })
  }).isRequired,
  styleSet: PropTypes.shape({
    audioCardAttachment: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(VideoCardAttachment);
