import PropTypes from 'prop-types';
import React from 'react';

import TextContent from './TextContent';

const TextAttachment = ({ attachment }) =>
  !!attachment.content &&
    <TextContent
      contentType={ attachment.contentType }
      text={ attachment.content }
    />

TextAttachment.propTypes = {
  attachment: PropTypes.shape({
    content: PropTypes.string.isRequired,
    contentType: PropTypes.string.isRequired
  }).isRequired
};

export default TextAttachment
