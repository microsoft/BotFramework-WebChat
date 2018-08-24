import React from 'react';

import { withActivity } from './Context';
import { withStyleSet } from '../Context';
import TimeAgo from '../Utils/TimeAgo';

export default withStyleSet(withActivity(({
  activity: { channelData: { state } = {}, timestamp },
  styleSet
}) =>
  <span className={ styleSet.timestamp }>
    {
      state === 'sending' ?
        'Sending'
      : state === 'send failed' ?
        'Send failed'
      :
        <TimeAgo value={ timestamp } />
    }
  </span>
))
