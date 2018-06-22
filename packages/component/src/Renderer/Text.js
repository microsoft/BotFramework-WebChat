import React from 'react';

import { withStyleSet } from '../Context';

export default withStyleSet(({ styleSet, value }) =>
  <div className={ styleSet.textCard }>
    { value }
  </div>
)
