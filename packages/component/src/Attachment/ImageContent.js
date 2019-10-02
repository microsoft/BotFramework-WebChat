import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import CroppedImage from '../Utils/CroppedImage';

const ImageContent = ({ alt, src, styleSet }) => (
  <CroppedImage alt={alt} height={styleSet.options.bubbleImageHeight} src={src} width="100%" />
);

ImageContent.defaultProps = {
  alt: ''
};

ImageContent.propTypes = {
  alt: PropTypes.string,
  src: PropTypes.string.isRequired,
  styleSet: PropTypes.shape({
    options: PropTypes.shape({
      bubbleImageHeight: PropTypes.number.isRequired
    }).isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(ImageContent);
