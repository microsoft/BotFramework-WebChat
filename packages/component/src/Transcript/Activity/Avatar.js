import classNames from 'classnames';
import React from 'react';

import Context from '../../Context';

export default props =>
  <Context.Consumer>
    { consumer =>
      <div className={ classNames(consumer.styleSet.avatar + '', (props.className || '') + '') }>
        WC
      </div>
    }
  </Context.Consumer>
