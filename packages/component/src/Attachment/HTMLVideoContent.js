import React from 'react';

import Context from '../Context';

export default ({
  alt,
  autoPlay,
  loop,
  poster,
  src
}) =>
  <Context.Consumer>
    { ({ styleSet }) =>
      <video
        aria-label={ alt }
        autoPlay={ autoPlay }
        className={ styleSet.videoContent }
        controls={ true }
        loop={ loop }
        poster={ poster }
        src={ src }
      />
    }
  </Context.Consumer>
