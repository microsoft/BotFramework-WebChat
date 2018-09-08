import React from 'react';

import Context from './Context';

export default ({ children, message }) =>
  <Context.Consumer>
    { ({ styleSet }) =>
      <div className={ styleSet.errorBox }>
        <div>{ message }</div>
        <div>{ children }</div>
      </div>
    }
  </Context.Consumer>
