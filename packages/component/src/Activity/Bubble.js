import classNames from 'classnames';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

export default connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(
  ({
    'aria-label': ariaLabel,
    children,
    className,
    fromUser,
    styleSet
  }) =>
    <div
      aria-label={ ariaLabel }
      className={ classNames(
        styleSet.bubble + '',
        { 'from-user': fromUser },
        (className || '') + ''
      ) }
    >
      { children }
    </div>
)
