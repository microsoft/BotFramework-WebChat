import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

const ROOT_CSS = css({
  height: 60,
  listStyleType: 'none',
  margin: 0,
  overflowX: 'auto',
  overflowY: 'hidden',
  padding: 0,
  whiteSpace: 'nowrap',

  '& > li': {
    display: 'inline-block',
    paddingBottom: 10,
    paddingLeft: 10,
    paddingTop: 10,
    whiteSpace: 'initial',

    '&:last-child': {
      paddingRight: 10
    }
  }
});

export default props =>
  <ul className={ classNames(ROOT_CSS + '', (props.className || '') + '') }>
    { React.Children.map(props.children, child => <li>{ child }</li>) }
  </ul>
