import React from 'react';

import ActivityComposer from './Composer';
import SingleAttachmentActivity from './SingleAttachmentActivity';
import MultipleAttachmentActivity from './MultipleAttachmentActivity';
import UnknownCard from '../../../playground/node_modules/component/lib/Attachment/UnknownCard';

export default ({ activity, children }) =>
  <ActivityComposer activity={ activity }>
    {
      ({ activity, attachments }) =>
        // Currently, we do not support multiple attachment originated from the user
        (attachments && attachments.length) ? (
          attachments.length === 1 || activity.from === 'user' ?
            <SingleAttachmentActivity>{ children }</SingleAttachmentActivity>
          :
            <MultipleAttachmentActivity>{ children }</MultipleAttachmentActivity>
        ) :
          <SingleAttachmentActivity>
            <UnknownCard message="This activity has no content.">{ JSON.stringify(activity, null, 2) }</UnknownCard>
          </SingleAttachmentActivity>
    }
  </ActivityComposer>
