import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { primaryFont } from '../Styles';

const ACCENT_COLOR = '#69F';

const ROOT_CSS = css({
  ...primaryFont,

  backgroundColor: 'White',
  borderColor: ACCENT_COLOR,
  borderStyle: 'solid',
  borderWidth: 2,
  color: ACCENT_COLOR,
  cursor: 'pointer',
  fontSize: 16,
  // fontWeight: 'bold',
  height: 40,

  paddingLeft: 20,
  paddingRight: 20
});

export default props =>
  <button
    className={ classNames(ROOT_CSS + '', props.className + '') }
  >
    { props.children }
  </button>
