import { type WebChatActivity } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo } from 'react';

import Slotted from './Slotted';
import Timestamp from './Timestamp';
import useStyleSet from '../hooks/useStyleSet';

type Props = Readonly<{ activity: WebChatActivity }>;

const SelfActivityStatus = memo(({ activity }: Props) => {
  const [{ sendStatus }] = useStyleSet();
  const { timestamp } = activity;

  return timestamp ? (
    <Slotted className={classNames('webchat__activity-status', 'webchat__activity-status--self', sendStatus + '')}>
      <Timestamp timestamp={timestamp} />
    </Slotted>
  ) : null;
});

SelfActivityStatus.displayName = 'SelfActivityStatus';

export default SelfActivityStatus;
