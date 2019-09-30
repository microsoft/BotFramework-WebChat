import PropTypes from 'prop-types';
import React from 'react';

import ImageContent from './ImageContent';

const ImageAttachment = ({ attachment }) => {
  return <ImageContent alt={attachment.name} src={attachment.thumbnailUrl || attachment.contentUrl} />;
};

ImageAttachment.propTypes = {
  activity: PropTypes.shape({
    attachments: PropTypes.array.isRequired
  }).isRequired,
  attachment: PropTypes.shape({
    contentUrl: PropTypes.string.isRequired,
    name: PropTypes.string
  }).isRequired
};

export default ImageAttachment;
