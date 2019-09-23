import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

const YouTubeContent = ({ alt, autoPlay, embedID, loop, styleSet: { youTubeContent } }) => {
  const search = new URLSearchParams({
    autoplay: autoPlay ? 1 : 0,
    loop: loop ? 1 : 0,
    modestbranding: 1
  }).toString();

  return (
    // TODO: We should encodeURI the URL
    <iframe
      allowFullScreen={true}
      aria-label={alt}
      className={youTubeContent}
      src={`https://youtube.com/embed/${embedID}?${search}`}
    />
  );
};

YouTubeContent.defaultProps = {
  alt: '',
  autoPlay: false,
  loop: false
};

YouTubeContent.propTypes = {
  alt: PropTypes.string,
  autoPlay: PropTypes.bool,
  embedID: PropTypes.string.isRequired,
  loop: PropTypes.bool,
  styleSet: PropTypes.shape({
    youTubeContent: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(YouTubeContent);
