import PropTypes from 'prop-types';
import React from 'react';

import ImageContent from './ImageContent';

const ImageAttachment = ({ attachment }) =>
  <ImageContent
    alt={ attachment.name }
    src={ attachment.contentUrl }
  />

ImageAttachment.propTypes = {
  attachment: PropTypes.shape({
    contentUrl: PropTypes.string,
    name: PropTypes.string
  })
};

export default ImageAttachment
