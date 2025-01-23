import { type WebChatActivity } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo } from 'react';

import Timestamp from './Timestamp';
import useStyleSet from '../hooks/useStyleSet';

type Props = Readonly<{ activity: WebChatActivity; className?: string | undefined }>;

const SelftActivityStatus = memo(({ activity, className }: Props) => {
  const [{ sendStatus }] = useStyleSet();
  const { timestamp } = activity;

  return timestamp ? (
    <span
      className={classNames('webchat__activity-status', 'webchat__activity-status--self', className, sendStatus + '')}
    >
      <Timestamp timestamp={timestamp} />
    </span>
  ) : null;
});

SelftActivityStatus.displayName = 'SelftActivityStatus';

export default SelftActivityStatus;
