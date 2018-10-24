import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

// TOOD: Move this to StyleSet
const ROOT_CSS = css({
  backgroundColor: 'Transparent',
  border: 0,
  height: '100%',
  padding: 0,
  width: 40,

  '&:not(:disabled)': {
    cursor: 'pointer'
  },

  '& > svg': {
    fill: '#999'
  },

  '&:disabled > svg': {
    fill: '#CCC'
  }
});

export default ({ alt, children, className, disabled, onClick }) =>
  <button
    className={ classNames(
      ROOT_CSS + '',
      (className || '') + ''
    ) }
    disabled= { disabled }
    onClick={ onClick }
    title={ alt }
    type="button"
  >
    { children }
  </button>
