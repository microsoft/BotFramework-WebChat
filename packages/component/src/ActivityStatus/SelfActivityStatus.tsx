import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { type WebChatActivity } from 'botframework-webchat-core';
import cx from 'classnames';
import React, { memo } from 'react';

import Timestamp from './Timestamp';

import styleClassNames from './ActivityStatus.module.css';

type Props = Readonly<{ activity: WebChatActivity; className?: string | undefined; slotted?: boolean }>;

const SelftActivityStatus = memo(({ activity, className, slotted }: Props) => {
  const classNames = useStyles(styleClassNames);
  const { timestamp } = activity;

  return timestamp ? (
    <span
      className={cx(classNames['activity-status'], { [classNames['activity-status--slotted']]: slotted }, className)}
    >
      <Timestamp timestamp={timestamp} />
    </span>
  ) : null;
});

SelftActivityStatus.displayName = 'SelftActivityStatus';

export default SelftActivityStatus;
