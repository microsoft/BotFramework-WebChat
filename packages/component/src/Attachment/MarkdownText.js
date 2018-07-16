import React from 'react';

import { withStyleSet } from '../Context';

export default withStyleSet(({ attachment: { content }, styleSet }) =>
  <pre className={ styleSet.codeCard }>
    { content.text }
  </pre>
)
