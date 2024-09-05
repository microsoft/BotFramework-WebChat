import PropTypes from 'prop-types';
import React from 'react';

import AnimationCardContent from './AnimationCardContent';

const AnimationCardAttachment = ({ attachment: { content }, disabled = undefined }) => (
  <AnimationCardContent content={content} disabled={disabled} />
);

AnimationCardAttachment.propTypes = {
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
  disabled: PropTypes.bool
};

export default AnimationCardAttachment;
