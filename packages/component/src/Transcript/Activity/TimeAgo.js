import React from 'react';

import { withActivity } from './Context';
import { withStyleSet } from '../../Context';
import TimeAgo from '../../Utils/TimeAgo';

export default withStyleSet(withActivity(({ activity: { timestamp }, styleSet }) =>
  <span className={ styleSet.timestamp }>
    <TimeAgo value={ timestamp } />
  </span>
))
