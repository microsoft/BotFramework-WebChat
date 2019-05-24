import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

const AudioContent = ({ autoPlay, loop, poster, src, styleSet }) => (
  <audio autoPlay={autoPlay} className={styleSet.audioContent} controls={true} loop={loop} poster={poster} src={src} />
);

AudioContent.defaultProps = {
  autoPlay: false,
  loop: false,
  poster: ''
};

AudioContent.propTypes = {
  autoPlay: PropTypes.bool,
  loop: PropTypes.bool,
  poster: PropTypes.string,
  src: PropTypes.string.isRequired,
  styleSet: PropTypes.shape({
    audioContent: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(AudioContent);
