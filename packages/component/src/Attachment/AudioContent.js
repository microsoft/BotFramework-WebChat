import React from 'react';

import connectToWebChat from '../connectToWebChat';

export default connectToWebChat(
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
