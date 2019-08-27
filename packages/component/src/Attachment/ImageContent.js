import PropTypes from 'prop-types';
import React from 'react';

import CroppedImage from '../Utils/CroppedImage';
import useStyleSet from '../hooks/useStyleSet';

const ImageContent = ({ alt, src }) => {
  const styleSet = useStyleSet();

  return <CroppedImage alt={alt} height={styleSet.options.bubbleImageHeight} src={src} width="100%" />;
};

ImageContent.defaultProps = {
  alt: ''
};

ImageContent.propTypes = {
  alt: PropTypes.string,
  src: PropTypes.string.isRequired
};

export default ImageContent;
