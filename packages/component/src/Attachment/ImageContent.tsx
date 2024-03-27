import { hooks } from 'botframework-webchat-api';
import PropTypes from 'prop-types';
import React, { type ReactNode } from 'react';

import CroppedImage from '../Utils/CroppedImage';

const { useStyleOptions } = hooks;

type ImageContentProps = Readonly<{
  alt?: string;
  src: string;
}>;

const ImageContent = ({ alt, src }: ImageContentProps): ReactNode => {
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
