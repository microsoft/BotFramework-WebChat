import classNames from 'classnames';
import React from 'react';

import ActivityContext from './Context';
import MainContext from '../../Context';

export default props =>
  <MainContext.Consumer>
    { ({ styleSet }) =>
      <ActivityContext.Consumer>
        { ({ activity: { from } }) =>
          <div className={ classNames(styleSet.avatar + '', (props.className || '') + '') }>
            { from === 'bot' ? 'BF' : 'WC' }
          </div>
        }
      </ActivityContext.Consumer>
    }
  </MainContext.Consumer>
