import classNames from 'classnames';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

export default connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    children,
    className,
    fromUser,
    styleSet
  }) =>
    <div
      className={ classNames(
        styleSet.avatar + '',
        { 'from-user': fromUser },
        (className || '') + ''
      ) }
    >
      { children }
    </div>
)
