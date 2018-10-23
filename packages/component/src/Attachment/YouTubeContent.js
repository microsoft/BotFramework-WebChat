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
      loop: loop ? 1 : 0,
      modestbranding: 1
    }).toString();

    return (
      <iframe
        aria-label={ alt }
        className={ styleSet.youTubeContent }
        src={ `https://youtube.com/embed/${ embedID }?${ search }` }
      />
    );
  }
)
