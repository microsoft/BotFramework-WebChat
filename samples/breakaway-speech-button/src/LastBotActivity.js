import React from 'react';

import { connectWithContext, Components } from 'botframework-webchat';

const { SpeakActivity } = Components;

export default connectWithContext(
  ({ activities }) => ({
    activity: activities.slice().reverse().find(({ from: { role }, type }) => role === 'bot' && type === 'message')
  })
)(({ activity }) =>
  !!activity &&
    <React.Fragment>
      <p>{ activity.text }</p>
      { activity.channelData && activity.channelData.speak && <SpeakActivity activity={ activity } /> }
    </React.Fragment>
)
