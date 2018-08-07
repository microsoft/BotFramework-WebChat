import React from 'react';

import Context from '../Context';

export default props =>
  <Context.Consumer>
    { ({ styleSet }) =>
      <audio
        autoPlay={ props.autoPlay }
        className={ styleSet.audioContent }
        controls={ true }
        loop={ props.loop }
        poster={ props.poster }
        src={ props.src }
      />
    }
  </Context.Consumer>
