/* eslint react/no-array-index-key: "off" */

import PropTypes from 'prop-types';
import React from 'react';

import { Components, hooks } from 'botframework-webchat-component';

import CommonCard from './CommonCard';

const { useStyleSet } = hooks;
const { VideoContent } = Components;

const VideoCardAttachment = ({
  attachment,
  attachment: { content: { media, autostart, autoloop, image: { url: imageURL } = {} } = {} } = {}
}) => {
  const [{ audioCardAttachment: audioCardAttachmentStyleSet }] = useStyleSet();

  return (
    <div className={audioCardAttachmentStyleSet}>
      <ul className="media-list">
        {media.map(({ url }, index) => (
          // Because of differences in browser implementations, aria-label=" " is used to make the screen reader not repeat the same text multiple times in Chrome v75 and Edge 44
          <li aria-label=" " key={index}>
            <VideoContent autoPlay={autostart} loop={autoloop} poster={imageURL} src={url} />
          </li>
        ))}
      </ul>
      <CommonCard attachment={attachment} />
    </div>
  );
};

VideoCardAttachment.propTypes = {
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
  }).isRequired
};

export default VideoCardAttachment;
