import classNames from 'classnames';
import React from 'react';

import { withStyleSet } from '../Context';

export default withStyleSet(({
  children,
  className,
  fromUser,
  styleSet
}) =>
  <div className={ classNames(
    styleSet.avatar + '',
    { 'from-user': fromUser },
    (className || '') + '')
  }>
    { children }
  </div>
)
