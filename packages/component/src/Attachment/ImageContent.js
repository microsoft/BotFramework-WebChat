import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React from 'react';

import CroppedImage from '../Utils/CroppedImage';

const { useStyleOptions } = hooks;

const ImageContent = ({ alt, src }) => {
  const [{ bubbleImageHeight }] = useStyleOptions();

  return <CroppedImage alt={alt} height={bubbleImageHeight} src={src} width="100%" />;
};

ImageContent.defaultProps = {
  alt: ''
};

ImageContent.propTypes = {
  alt: PropTypes.string,
  src: PropTypes.string.isRequired
};

export default ImageContent;
