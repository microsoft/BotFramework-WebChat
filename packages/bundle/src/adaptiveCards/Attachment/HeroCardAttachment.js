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
      buttons: PropTypes.any,
      images: PropTypes.arrayOf(
        PropTypes.shape({
          alt: PropTypes.string,
          tap: PropTypes.any,
          url: PropTypes.string.isRequired
        })
      ),
      subtitle: PropTypes.string,
      tap: PropTypes.any,
      text: PropTypes.string,
      title: PropTypes.string
    }).isRequired
  }).isRequired,
  disabled: PropTypes.bool
};

export default HeroCardAttachment;
