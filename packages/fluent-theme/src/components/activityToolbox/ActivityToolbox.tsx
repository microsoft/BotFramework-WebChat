import type { WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { array, looseObject, optional, parse, string } from 'valibot';
import { useStyles } from '../../styles';
import getMessageEntity from '../../utils/getMessageEntity';
import styles from './ActivityToolbox.module.css';
import CopyButton from './CopyButton';

type Props = Readonly<{ activity: WebChatActivity }>;

const activitySchema = looseObject({
  entities: optional(array(looseObject({ type: string() }))),
  type: string()
});

const ActivityToolbox = (props: Props) => {
  const activity = useMemo(() => parse(activitySchema, props.activity), [props.activity]);
  const classNames = useStyles(styles);

  const allowCopy = useMemo(() => getMessageEntity(activity)?.keywords.includes('AllowCopy'), [activity]);

  return allowCopy ? (
    <div className={classNames['activity-toolbox']}>
      <CopyButton activity={activity} />
    </div>
  ) : null;
};

ActivityToolbox.displayName = 'ActivityToolbox';

export default memo(ActivityToolbox);
