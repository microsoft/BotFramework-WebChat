import PropTypes from 'prop-types';
import React from 'react';

import HeroCardContent from './HeroCardContent';

const HeroCardAttachment = ({ attachment: { content } = {}, disabled }) =>
  !!content && <HeroCardContent content={content} disabled={disabled} />;

HeroCardAttachment.defaultProps = {
  disabled: undefined
};

HeroCardAttachment.propTypes = {
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      tap: PropTypes.any
    }).isRequired
  }).isRequired,
  disabled: PropTypes.bool
};

export default HeroCardAttachment;
