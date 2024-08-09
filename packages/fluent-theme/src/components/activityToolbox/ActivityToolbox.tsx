import type { WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { array, looseObject, parse, string } from 'valibot';
import { useStyles } from '../../styles';
import getMessageEntity from '../../utils/getMessageEntity';
import styles from './ActivityToolbox.module.css';
import CopyButton from './CopyButton';

type Props = Readonly<{ activity: WebChatActivity }>;

const activitySchema = looseObject({
  entities: array(
    looseObject({
      type: string()
    })
  ),
  type: string()
});

const ActivityToolbox = (props: Props) => {
  const activity = useMemo(() => parse(activitySchema, props.activity), [props.activity]);
  const classNames = useStyles(styles);

  const allowCopy = useMemo(() => getMessageEntity(activity)?.keywords.includes('AllowCopy'), [activity]);

  return <div className={classNames['activity-toolbox']}>{allowCopy && <CopyButton activity={activity} />}</div>;
};

ActivityToolbox.displayName = 'ActivityToolbox';

export default memo(ActivityToolbox);
