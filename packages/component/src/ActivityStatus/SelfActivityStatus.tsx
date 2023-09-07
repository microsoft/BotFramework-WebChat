import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo } from 'react';

import Slotted from './private/Slotted';
import Timestamp from './Timestamp';

type Props = { activity: WebChatActivity };

const SelfActivityStatus = memo(({ activity }: Props) => {
  const { timestamp } = activity;

  return timestamp ? (
    <Slotted>
      <Timestamp timestamp={timestamp} />
    </Slotted>
  ) : null;
});

SelfActivityStatus.displayName = 'SelfActivityStatus';

export default SelfActivityStatus;
