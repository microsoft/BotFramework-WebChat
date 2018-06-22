import React from 'react';

import { withStyleSet } from '../Context';

export default withStyleSet(({ children, styleSet }) =>
  <pre className={ styleSet.codeCard }>
    { children }
  </pre>
)
