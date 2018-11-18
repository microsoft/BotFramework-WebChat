import classNames from 'classnames';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

export default connectToWebChat(
  ({ styleSet }) => ({ styleSet })
)(({ alt, children, className, disabled, onClick, styleSet, direction }) =>
  <button
    className={ classNames(
      styleSet.sendBoxButton + '',
      (className || '') + '',
      'btn-' + direction
    ) }
    disabled= { disabled }
    onClick={ onClick }
    title={ alt }
    type="button"
  >
    { children }
  </button>
)
