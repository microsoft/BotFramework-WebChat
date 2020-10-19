/* eslint react/no-array-index-key: "off" */

import PropTypes from 'prop-types';
import React from 'react';

import VideoCardContent from './VideoCardContent';

const VideoCardAttachment = ({ attachment: { content }, disabled }) => (
  <VideoCardContent content={content} disabled={disabled} />
);

VideoCardAttachment.defaultProps = {
  disabled: undefined
};

VideoCardAttachment.propTypes = {
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      autoloop: PropTypes.bool,
      autostart: PropTypes.bool,
      image: PropTypes.shape({
        url: PropTypes.string.isRequired
      }),
      media: PropTypes.arrayOf(
        PropTypes.shape({
          profile: PropTypes.string.isRequired,
          url: PropTypes.string
        })
      )
    })
  }).isRequired,
  disabled: PropTypes.bool
};

export default VideoCardAttachment;
