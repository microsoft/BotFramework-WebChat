import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { primaryFont } from '../Styles';

const ROOT_CSS = css({
  ...primaryFont,

  backgroundColor: 'Black',
  borderRadius: '50%',
  color: 'White',
  height: 40,
  lineHeight: '40px',
  textAlign: 'center',
  width: 40
});

export default props =>
  <div className={ classNames(ROOT_CSS + '', (props.className || '') + '') }>
    WC
  </div>
