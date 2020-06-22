/* eslint react/no-array-index-key: "off" */

import PropTypes from 'prop-types';
import React from 'react';

import AudioCardContent from './AudioCardContent';

const AudioCardAttachment = ({ attachment: { content }, disabled }) => (
  <AudioCardContent content={content} disabled={disabled} />
);

AudioCardAttachment.defaultProps = {
  disabled: undefined
};

AudioCardAttachment.propTypes = {
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      autostart: PropTypes.bool,
      autoloop: PropTypes.bool,
      image: PropTypes.shape({
        url: PropTypes.string.isRequired
      }),
      media: PropTypes.arrayOf(
        PropTypes.shape({
          url: PropTypes.string.isRequired
        }).isRequired
      ).isRequired
    })
  }).isRequired,
  disabled: PropTypes.bool
};

export default AudioCardAttachment;
