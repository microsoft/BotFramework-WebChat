import classNames from 'classnames';
import React from 'react';

import { withStyleSet } from '../../Context';

export default withStyleSet(({ children, className, styleSet }) =>
  <div className={ classNames(styleSet.bubble + '', (className || '') + '') }>
    { children }
  </div>
)
