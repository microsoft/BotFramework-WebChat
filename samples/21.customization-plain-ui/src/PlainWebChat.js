import { connectToWebChat } from 'botframework-webchat-component';
import React, { useState } from 'react';

import Attachment from './Attachment';
import SuggestedActions from './SuggestedActions';

import getValueOrUndefined from './util/getValueOrUndefined';

const PlainWebChat = ({ activities, sendMessage }) => {
  const [sendBoxValue, setSendBoxValue] = useState('');

  return (
    <div>
      <ul>
        {activities
          // Currently, this sample only displays an activity of type "message"
          .filter(({ type }) => type === 'message')
          // We need to hide "postBack" message sent by the user
          .filter(({ channelData: { postBack } = {}, from: { role } }) => !(role === 'user' && postBack))
          // Normalize the activity:
          // - Every activity should have an "attachments" array, consisting of zero or more attachments:
          // - If this is a "messageBack" message, we should use the "displayText",
          //   because "text" is being submitted to bot, and "displayText" is what we use to override what the bot displays to the user.
          .map(activity => ({
            ...activity,
            attachments: activity.attachments || [],
            text: getValueOrUndefined(activity, 'channelData', 'messageBack', 'displayText') || activity.text
          }))
          // Filter out all empty messages (no attachments or text)
          .filter(({ attachments, text }) => attachments.length || text)
          .map((activity, index) => (
            <React.Fragment key={activity.id || index}>
              <li>
                {!!activity.text && (
                  // We are using the very same component for text message and attachments.
                  // This is because, attachments can also have "text/markdown" or "text/plain" content.
                  // In this case, we prefer to have a single component for both of them.
                  <Attachment
                    content={activity.text}
                    contentType={activity.textFormat === 'markdown' ? 'text/markdown' : 'text/plain'}
                  />
                )}
                {!!activity.attachments.length && (
                  <ul>
                    {activity.attachments.map((attachment, index) => (
                      <li key={index}>
                        <Attachment {...attachment} />
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </React.Fragment>
          ))}
      </ul>
      <div>
        {/* This is the send box, and suggested actions change based on the send box, not activity */}
        <SuggestedActions />
        <form
          onSubmit={event => {
            event.preventDefault();

            sendMessage(sendBoxValue);
            setSendBoxValue('');
          }}
        >
          <input
            autoFocus={true}
            onChange={({ target: { value } }) => setSendBoxValue(value)}
            type="textbox"
            value={sendBoxValue}
          />
        </form>
      </div>
    </div>
  );
};

export default connectToWebChat(({ activities, sendMessage }) => ({
  activities,
  sendMessage
}))(PlainWebChat);
