import PropTypes from 'prop-types';
import React from 'react';

import ThumbnailCardContent from './ThumbnailCardContent';

const ThumbnailCardAttachment = ({ attachment: { content }, disabled }) => (
  <ThumbnailCardContent content={content} disabled={disabled} />
);

ThumbnailCardAttachment.defaultProps = {
  disabled: undefined
};

ThumbnailCardAttachment.propTypes = {
  attachment: PropTypes.shape({
    content: PropTypes.shape({
      buttons: PropTypes.array,
      images: PropTypes.arrayOf(
        PropTypes.shape({
          alt: PropTypes.string.isRequired,
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

export default ThumbnailCardAttachment;
