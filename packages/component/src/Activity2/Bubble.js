import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import Context from '../Context';

const ROOT_CSS = css({});

export default ({ children, className, fromUser }) =>
  <Context.Consumer>
    { ({ styleSet }) =>
      <div
        className={ classNames(
          ROOT_CSS + '',
          styleSet.bubble + '',
          { 'from-user': fromUser },
          (className || '') + ''
        ) }
      >
        { children }
      </div>
    }
  </Context.Consumer>
