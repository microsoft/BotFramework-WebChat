import React from 'react';

import { withStyleSet } from '../Context';

export default withStyleSet(({ attachment: { content }, styleSet }) =>
  <p className={ styleSet.textCard }>
    { content.text }
  </p>
)

// export default props => <p>{ JSON.stringify(props) }</p>
