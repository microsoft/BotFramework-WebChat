import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

const HTMLVideoContent = ({ alt, autoPlay, loop, poster, src, styleSet }) => (
  <video
    aria-label={alt}
    autoPlay={autoPlay}
    className={styleSet.videoContent}
    controls={true}
    loop={loop}
    poster={poster}
    src={src}
  />
);

HTMLVideoContent.defaultProps = {
  alt: '',
  autoPlay: false,
  loop: false,
  poster: ''
};

HTMLVideoContent.propTypes = {
  alt: PropTypes.string,
  autoPlay: PropTypes.bool,
  loop: PropTypes.bool,
  poster: PropTypes.string,
  src: PropTypes.string.isRequired,
  styleSet: PropTypes.shape({
    videoContent: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(HTMLVideoContent);
