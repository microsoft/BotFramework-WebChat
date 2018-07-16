import React from 'react';

import { withStyleSet } from '../Context';

export default withStyleSet(({ card, styleSet }) =>
  <pre className={ styleSet.codeCard }>
    { card.text }
  </pre>
)
