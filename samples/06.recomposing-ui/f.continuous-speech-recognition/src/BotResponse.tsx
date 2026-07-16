import React, { memo } from 'react';
import useUnSpokenActivities from './useUnSpokenActivities';
import { Components } from 'botframework-webchat';

const { SpeakActivity } = Components;

function BotResponse() {
  const unSpokenActivities = useUnSpokenActivities();

  return (
    <React.Fragment>
      {unSpokenActivities.map(activity => (
        <SpeakActivity activity={activity} key={activity.id} />
      ))}
    </React.Fragment>
  );
}

export default memo(BotResponse);
