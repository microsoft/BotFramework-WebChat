import React from 'react';

import ActivityComposer from './Composer';
import SingleCardActivity from './SingleCardActivity';
import MultipleCardActivity from './MultipleCardActivity';

export default ({ activity, children }) =>
  <ActivityComposer activity={ activity }>
    {
      // Currently, we do not support multiple card originated from the user
      activity.cards.length === 1 || activity.from === 'user' ?
        <SingleCardActivity>{ children }</SingleCardActivity>
      :
        <MultipleCardActivity>{ children }</MultipleCardActivity>
    }
  </ActivityComposer>
