import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

const ROOT_CSS = css({
  background: 'White',
  maxWidth: 480,
  minHeight: 40,
  // minWidth: 250,
  position: 'relative'
});

export default ({ children, className }) =>
  <div
    className={ classNames(
      ROOT_CSS + '',
      // styleSet.bubble + '',
      (className || '') + ''
    ) }
  >
    { children }
  </div>
