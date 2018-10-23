import React from 'react';

import connectWithContext from './connectWithContext';

export default connectWithContext(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    children,
    message,
    styleSet
  }) =>
    <div className={ styleSet.errorBox }>
      <div>{ message }</div>
      <div>{ children }</div>
    </div>
)
