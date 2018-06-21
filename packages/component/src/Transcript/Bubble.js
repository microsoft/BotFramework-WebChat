import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import { primarySmallFont } from '../Styles';

const ROOT_CSS = css({
  '& > .content': {
    backgroundColor: 'White',
    minHeight: 20,
    padding: 10
  },

  '& > .timestamp': {
    ...primarySmallFont,
    color: 'rgba(0, 0, 0, .2)',
    paddingTop: 5
  }
});

export default props =>
  <div className={ classNames(ROOT_CSS + '', props.className + '') }>
    <div className="content">
      { props.children }
    </div>
    <div className="timestamp">{ props.timestamp }</div>
  </div>
