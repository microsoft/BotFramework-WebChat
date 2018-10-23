import React from 'react';

import connectWithContext from '../connectWithContext';

export default connectWithContext(
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
      <iframe
        aria-label={ alt }
        className={ styleSet.vimeoContent }
        src={ `https://player.vimeo.com/video/${ embedID }?${ search }` }
      />
    );
  }
)
