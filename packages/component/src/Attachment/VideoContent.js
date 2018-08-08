import React from 'react';

import Context from '../Context';

export default props =>
  <Context.Consumer>
    { ({ styleSet }) =>
      <video
        autoPlay={ props.autoPlay }
        className={ styleSet.videoContent }
        controls={ true }
        loop={ props.loop }
        poster={ props.poster }
        src={ props.src }
      />
    }
  </Context.Consumer>
