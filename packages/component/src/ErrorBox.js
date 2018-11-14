import React from 'react';

import connectToWebChat from './connectToWebChat';

export default connectToWebChat(
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
