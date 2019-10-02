import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

const AudioContent = ({ alt, autoPlay, loop, poster, src, styleSet }) => (
  <audio
    aria-label={alt}
    autoPlay={autoPlay}
    className={styleSet.audioContent}
    controls={true}
    loop={loop}
    poster={poster}
    src={src}
  />
);

AudioContent.defaultProps = {
  alt: '',
  autoPlay: false,
  loop: false,
  poster: ''
};

AudioContent.propTypes = {
  alt: PropTypes.string,
  autoPlay: PropTypes.bool,
  loop: PropTypes.bool,
  poster: PropTypes.string,
  src: PropTypes.string.isRequired,
  styleSet: PropTypes.shape({
    audioContent: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(AudioContent);
