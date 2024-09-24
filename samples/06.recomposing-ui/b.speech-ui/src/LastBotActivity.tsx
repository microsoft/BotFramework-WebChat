import React, { memo } from 'react';

import { Components, hooks } from 'botframework-webchat';

const { SpeakActivity } = Components;
const { useActivities } = hooks;

function LastBotActivity({ className }: Readonly<{ className?: string | undefined }>) {
  const [activities] = useActivities();

  const activity = activities
    .slice()
    .reverse()
    .find(({ from: { role }, type }) => role === 'bot' && type === 'message');

  return (
    !!activity && (
      <React.Fragment>
        <p className={className}>{(activity as any).text}</p>
        {activity.channelData?.speak && <SpeakActivity activity={activity} />}
      </React.Fragment>
    )
  );
}

export default memo(LastBotActivity);
