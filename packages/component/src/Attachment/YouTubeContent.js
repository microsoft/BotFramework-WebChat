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
      loop: loop ? 1 : 0,
      modestbranding: 1
    }).toString();

    return (
      // TODO: We should encodeURI the URL
      <iframe
        aria-label={ alt }
        className={ styleSet.youTubeContent }
        src={ `https://youtube.com/embed/${ embedID }?${ search }` }
      />
    );
  }
)
