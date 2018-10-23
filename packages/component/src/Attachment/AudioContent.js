import React from 'react';

import connectWithContext from '../connectWithContext';

export default connectWithContext(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    autoPlay,
    loop,
    poster,
    src,
    styleSet
  }) =>
    <audio
      autoPlay={ autoPlay }
      className={ styleSet.audioContent }
      controls={ true }
      loop={ loop }
      poster={ poster }
      src={ src }
    />
)
