import React from 'react';

import { withStyleSet } from '../Context';

export default withStyleSet(({ children, message, styleSet }) =>
  <div className={ styleSet.unknownCard }>
    <div>{ message }</div>
    <pre>{ children }</pre>
  </div>
)
