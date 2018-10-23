import React from 'react';

import connectWithContext from '../connectWithContext';

export default connectWithContext(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    alt,
    autoPlay,
    loop,
    poster,
    src,
    styleSet
  }) =>
    <video
      aria-label={ alt }
      autoPlay={ autoPlay }
      className={ styleSet.videoContent }
      controls={ true }
      loop={ loop }
      poster={ poster }
      src={ src }
    />
)
