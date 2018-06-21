import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import Context from '../Context';

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
  <Context.Consumer>
    { consumer =>
      <div className={ classNames(consumer.styleSet.avatar + '', (props.className || '') + '') }>
        WC
      </div>
    }
  </Context.Consumer>
