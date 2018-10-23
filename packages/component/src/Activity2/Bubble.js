import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import connectWithContext from '../connectWithContext';

const ROOT_CSS = css({});

export default connectWithContext(
  ({ styleSet }) => ({ styleSet })
)(
  ({ children, className, fromUser, styleSet }) =>
    <div
      className={ classNames(
        ROOT_CSS + '',
        styleSet.bubble + '',
        { 'from-user': fromUser },
        (className || '') + ''
      ) }
    >
      { children }
    </div>
)
