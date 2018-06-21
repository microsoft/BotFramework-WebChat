import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import Context from '../Context';

import { primaryFont } from '../Styles';

export default props =>
  <Context.Consumer>
    { consumer =>
      <div className={ classNames(consumer.styleSet.avatar + '', (props.className || '') + '') }>
        WC
      </div>
    }
  </Context.Consumer>
