import PropTypes from 'prop-types';
import React from 'react';

import TextContent from './TextContent';

const TextAttachment = ({ attachment: { content = '', contentType } = {} }) => (
  <TextContent contentType={contentType} text={content} />
);

TextAttachment.propTypes = {
  attachment: PropTypes.shape({
    content: PropTypes.string,
    contentType: PropTypes.string.isRequired
  }).isRequired
};

export default TextAttachment;
