import PropTypes from 'prop-types';
import React from 'react';

import useStyleSet from '../hooks/useStyleSet';

const AudioContent = ({ alt, autoPlay, loop, poster, src }) => {
  const [{ audioContent: audioContentStyleSet }] = useStyleSet();

  return (
    <audio
      aria-label={alt}
      autoPlay={autoPlay}
      className={audioContentStyleSet}
      controls={true}
      loop={loop}
      poster={poster}
      src={src}
    />
  );
};

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
  src: PropTypes.string.isRequired
};

export default AudioContent;
