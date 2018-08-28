import classNames from 'classnames';
import React from 'react';

import { withStyleSet } from '../Context';

export default withStyleSet(({
  className,
  fromUser,
  styleSet
}) =>
  <div className={ classNames(
    styleSet.avatar + '',
    (className || '') + '')
  }>
    { fromUser ? 'BF' : 'WC' }
  </div>
)
