import PropTypes from 'prop-types';
import React from 'react';

import ImageContent from './ImageContent';

const ImageAttachment = ({ activity, attachment }) => {
  const { attachmentThumbnails } = activity.channelData || {};

  if (attachmentThumbnails) {
    const attachmentThumbnail = attachmentThumbnails[activity.attachments.indexOf(attachment)];

    if (attachmentThumbnail) {
      return <ImageContent alt={attachment.name} src={attachmentThumbnail} />;
    }
  }

  return <ImageContent alt={attachment.name} src={attachment.contentUrl} />;
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
