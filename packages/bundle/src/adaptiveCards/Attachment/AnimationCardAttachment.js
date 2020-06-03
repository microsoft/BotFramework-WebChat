import PropTypes from 'prop-types';
import React from 'react';

import AnimationCardContent from './AnimationCardContent';

const AnimationCardAttachment = ({ attachment: { content }, disabled }) => (
  <AnimationCardContent content={content} disabled={disabled} />
);

AnimationCardAttachment.defaultProps = {
  disabled: undefined
};

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
