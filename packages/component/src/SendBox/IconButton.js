import classNames from 'classnames';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

export default connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(({ alt, children, className, disabled, onClick, styleSet }) =>
  <button
    className={ classNames(
      styleSet.sendBoxButton + '',
      (className || '') + ''
    ) }
    disabled= { disabled }
    onClick={ onClick }
    title={ alt }
    type="button"
  >
    { children }
  </button>
)
