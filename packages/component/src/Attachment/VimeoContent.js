import React from 'react';

import connectToWebChat from '../connectToWebChat';

export default connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    alt,
    autoPlay,
    embedID,
    loop,
    styleSet
  }) => {
    const search = new URLSearchParams({
      autoplay: autoPlay ? 1 : 0,
      badge: 0,
      byline: 0,
      loop: loop ? 1 : 0,
      portrait: 0,
      title: 0
    }).toString();

    return (
      // TODO: We should encodeURI the URL
      <iframe
        aria-label={ alt }
        className={ styleSet.vimeoContent }
        src={ `https://player.vimeo.com/video/${ embedID }?${ search }` }
      />
    );
  }
)
