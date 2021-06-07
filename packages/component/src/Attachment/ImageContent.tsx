import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React, { FC } from 'react';

import CroppedImage from '../Utils/CroppedImage';

const { useStyleOptions } = hooks;

type ImageContentProps = {
  alt?: string;
  src: string;
};

const ImageContent: FC<ImageContentProps> = ({ alt, src }) => {
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
