import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo } from 'react';
import { useStyles } from '../../../styles/index.js';
import styles from './LinerMessageActivity.module.css';

type Props = Readonly<{ activity: WebChatActivity & { type: 'message' } }>;

const LinerMessageActivity = ({ activity }: Props) => {
  const classNames = useStyles(styles);

  return (
    <div className={classNames['liner-message-activity']} role="separator">
      <span>{activity.text}</span>
    </div>
  );
};

LinerMessageActivity.displayName = 'LinerMessageActivity';

export default memo(LinerMessageActivity);
