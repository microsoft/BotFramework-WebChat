import React from 'react';

import { withStyleSet } from '../Context';

export default withStyleSet(({ card, styleSet, value }) =>
  <p className={ styleSet.textCard }>
    { card.text }
  </p>
)
