import { hooks } from 'botframework-webchat-component';
import React, { useCallback, useState } from 'react';

import Attachment from './Attachment';
import SuggestedActions from './SuggestedActions';

import getValueOrUndefined from './util/getValueOrUndefined';

console.log(hooks);
const { useActivities, useSendMessage } = hooks;

const PlainWebChat = () => {
  const [activities] = useActivities();
  const sendMessage = useSendMessage();

  const [sendBoxValue, setSendBoxValue] = useState('');

  const handleChange = useCallback(({ target: { value } }) => setSendBoxValue(value), [setSendBoxValue]);

  const handleSubmit = useCallback(
    event => {
      event.preventDefault();

      sendMessage(sendBoxValue);
      setSendBoxValue('');
    },
    [sendBoxValue, sendMessage, setSendBoxValue]
  );

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
        <form onSubmit={handleSubmit}>
          <input autoFocus={true} onChange={handleChange} type="textbox" value={sendBoxValue} />
        </form>
      </div>
    </div>
  );
};

export default PlainWebChat;
