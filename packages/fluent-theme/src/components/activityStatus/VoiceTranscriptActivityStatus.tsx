import { hooks } from 'botframework-webchat';
import { Timestamp } from 'botframework-webchat/component';
import { getVoiceActivityRole, type WebChatActivity } from 'botframework-webchat/internal';
import React, { Fragment, memo } from 'react';

import { useStyles } from '../../styles';
import styles from './VoiceTranscriptActivityStatus.module.css';

const { useLocalizer } = hooks;

type VoiceTranscriptActivityStatusProps = Readonly<{
  activity: WebChatActivity;
}>;

function VoiceTranscriptActivityStatus({ activity }: VoiceTranscriptActivityStatusProps) {
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  const { timestamp } = activity;
  const role = getVoiceActivityRole(activity);

  const agentLabel = localize('ACTIVITY_STATUS_VOICE_TRANSCRIPT_AGENT_LABEL');

  return (
    <span className={classNames['voice-transcript-activity-status']}>
      {role === 'bot' && (
        <Fragment>
          <span className={classNames['voice-transcript-activity-status__agent-label']}>{agentLabel}</span>
          {timestamp && <span className={classNames['voice-transcript-activity-status__divider']}>{'|'}</span>}
        </Fragment>
      )}
      {timestamp && <Timestamp timestamp={timestamp} />}
    </span>
  );
}

export default memo(VoiceTranscriptActivityStatus);
