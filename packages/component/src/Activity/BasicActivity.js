import React from 'react';

import ActivityComposer from './Composer';
import SingleAttachmentActivity from './SingleAttachmentActivity';
import MultipleAttachmentActivity from './MultipleAttachmentActivity';

export default ({ activity, children }) =>
  <ActivityComposer activity={ activity }>
    {
      ({ activity, attachments }) =>
        // Currently, we do not support multiple attachment originated from the user
        attachments && attachments.length && (
          attachments.length === 1 || activity.from === 'user' ?
            <SingleAttachmentActivity>{ children }</SingleAttachmentActivity>
          :
            <MultipleAttachmentActivity>{ children }</MultipleAttachmentActivity>
        )
    }
  </ActivityComposer>
