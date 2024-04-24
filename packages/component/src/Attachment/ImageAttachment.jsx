import PropTypes from 'prop-types';
import React from 'react';

import ImageContent from './ImageContent';
import readDataURIToBlob from '../Utils/readDataURIToBlob';

const ImageAttachment = ({ attachment }) => {
  let imageURL = attachment.thumbnailUrl || attachment.contentUrl;

  // To support Content Security Policy, data URI cannot be used.
  // We need to parse the data URI into a blob: URL.
  const blob = readDataURIToBlob(imageURL);

  if (blob) {
    imageURL = URL.createObjectURL(blob);
  }

  return <ImageContent alt={attachment.name} src={imageURL} />;
};

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
