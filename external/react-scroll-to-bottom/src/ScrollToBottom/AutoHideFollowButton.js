import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import Context from './Context';

const ROOT_CSS = css({
  backgroundColor: 'rgba(0, 0, 0, .2)',
  borderRadius: 10,
  borderWidth: 0,
  bottom: 5,
  cursor: 'pointer',
  height: 20,
  outline: 0,
  position: 'absolute',
  right: 20,
  width: 20,

  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, .4)'
  },

  '&:active': {
    backgroundColor: 'rgba(0, 0, 0, .6)'
  }
});

export default ({ className }) =>
  <Context.Consumer>
    { context => !context.atEnd &&
        <button
          className={ classNames(ROOT_CSS + '', (className || '') + '') }
          onClick={ context.scrollToEnd }
        />
    }
  </Context.Consumer>
