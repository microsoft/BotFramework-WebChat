import React from 'react';

import { connectToWebChat, Components } from 'botframework-webchat';

const { SpeakActivity } = Components;

export default connectToWebChat(
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
