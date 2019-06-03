import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

const VimeoContent = ({ alt, autoPlay, embedID, loop, styleSet }) => {
  const search = new URLSearchParams({
    autoplay: autoPlay ? 1 : 0,
    badge: 0,
    byline: 0,
    loop: loop ? 1 : 0,
    portrait: 0,
    title: 0
  }).toString();

  return (
    <iframe
      aria-label={alt}
      className={styleSet.vimeoContent}
      src={`https://player.vimeo.com/video/${encodeURI(embedID)}?${search}`}
    />
  );
};

VimeoContent.defaultProps = {
  alt: '',
  autoPlay: false,
  loop: false
};

VimeoContent.propTypes = {
  alt: PropTypes.string,
  autoPlay: PropTypes.bool,
  embedID: PropTypes.string.isRequired,
  loop: PropTypes.bool,
  styleSet: PropTypes.shape({
    vimeoContent: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(VimeoContent);
