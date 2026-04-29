import { Timestamp } from 'botframework-webchat/component';
import { getVoiceActivityRole, getVoiceActivityText, type WebChatActivity } from 'botframework-webchat/internal';
import React, { memo } from 'react';

import { FluentIcon } from '../icon';
import { useStyles } from '../../styles';
import styles from './VoiceTranscriptActivityStatus.module.css';

type VoiceTranscriptActivityStatusProps = Readonly<{
  activity: WebChatActivity;
}>;

function VoiceTranscriptActivityStatus({ activity }: VoiceTranscriptActivityStatusProps) {
  const classNames = useStyles(styles);
  const { timestamp } = activity;

  if (!getVoiceActivityText(activity)) {
    return null;
  }

  const icon = getVoiceActivityRole(activity) === 'bot' ? 'audio-playing' : 'microphone-regular';

  return (
    <span className={classNames['voice-transcript-activity-status']}>
      {timestamp && <Timestamp timestamp={timestamp} />}
      {timestamp && <span className={classNames['voice-transcript-activity-status__divider']}>{'|'}</span>}
      <FluentIcon appearance="text" className={classNames['voice-transcript-activity-status__icon']} icon={icon} />
    </span>
  );
}

export default memo(VoiceTranscriptActivityStatus);
