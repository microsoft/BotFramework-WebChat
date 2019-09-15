import React from 'react';

import { Components, hooks } from 'botframework-webchat';

const { SpeakActivity } = Components;
const { useActivities } = hooks;

const LastBotActivity = () => {
  const [activities] = useActivities();
  const activity = activities
    .slice()
    .reverse()
    .find(({ from: { role }, type }) => role === 'bot' && type === 'message');

  return (
    !!activity && (
      <React.Fragment>
        <p>{activity.text}</p>
        {activity.channelData && activity.channelData.speak && <SpeakActivity activity={activity} />}
      </React.Fragment>
    )
  );
};

export default LastBotActivity;
