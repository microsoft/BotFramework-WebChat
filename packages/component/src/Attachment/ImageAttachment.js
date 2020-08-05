import PropTypes from 'prop-types';
import React from 'react';

import ImageContent from './ImageContent';

const ImageAttachment = ({ attachment }) => (
  <ImageContent alt={attachment.name} src={attachment.thumbnailUrl || attachment.contentUrl} />
);

ImageAttachment.propTypes = {
  // Either attachment.contentUrl or attachment.thumbnailUrl must be specified.
  attachment: PropTypes.oneOfType([
    PropTypes.shape({
      contentUrl: PropTypes.string.isRequired,
      name: PropTypes.string,
      thumbnailUrl: PropTypes.string
    }),
    PropTypes.shape({
      contentUrl: PropTypes.string,
      name: PropTypes.string,
      thumbnailUrl: PropTypes.string.isRequired
    })
  ]).isRequired
};

export default ImageAttachment;
