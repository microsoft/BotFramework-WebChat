import classNames from 'classnames';
import React from 'react';

import { withStyleSet } from '../../Context';
import ActivityContext from './Context';

export default withStyleSet(({ className, styleSet }) =>
  <ActivityContext.Consumer>
    { ({ activity: { from } }) =>
      <div className={ classNames(styleSet.avatar + '', (className || '') + '') }>
        { from === 'bot' ? 'BF' : 'WC' }
      </div>
    }
  </ActivityContext.Consumer>
)
