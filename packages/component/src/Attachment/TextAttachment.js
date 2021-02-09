import PropTypes from 'prop-types';
import React from 'react';

import FileAttachment from './FileAttachment';
import TextContent from './TextContent';

const TextAttachment = ({ activity, attachment, attachment: { content = '', contentType } = {} }) => {
  if (!attachment.content) {
    return <FileAttachment activity={activity} attachment={attachment} />;
  }

  return <TextContent contentType={contentType} text={content} />;
};

TextAttachment.propTypes = {
  activity: PropTypes.any.isRequired,
  attachment: PropTypes.shape({
    content: PropTypes.string,
    contentType: PropTypes.string.isRequired
  }).isRequired
};

export default TextAttachment;
