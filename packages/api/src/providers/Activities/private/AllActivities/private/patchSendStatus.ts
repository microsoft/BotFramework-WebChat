import { type WebChatActivity } from 'botframework-webchat-core';

const SENDING = 'sending';
const SEND_FAILED = 'send failed';
const SENT = 'sent';

function getClientActivityID(activity: WebChatActivity): string | undefined {
  return activity.channelData?.clientActivityID;
}

export default function patchSendStatus(
  activities: readonly Readonly<WebChatActivity>[],
  activity: WebChatActivity
): WebChatActivity {
  if (activity.from.role === 'user') {
    const { id } = activity;
    const clientActivityID = getClientActivityID(activity);

    const existingActivity = activities.find(
      activity => (clientActivityID && getClientActivityID(activity) === clientActivityID) || (id && activity.id === id)
    );

    if (existingActivity) {
      const {
        channelData: { 'webchat:send-status': sendStatus }
      } = existingActivity;

      if (sendStatus === SENDING || sendStatus === SEND_FAILED || sendStatus === SENT) {
        activity = {
          ...activity,
          channelData: {
            ...activity.channelData,
            'webchat:send-status': sendStatus
          }
          // TODO: Fix this.
        } as any;
      }
    } else {
      // If there are no existing activity, probably this activity is restored from chat history.
      // All outgoing activities restored from service means they arrived at the service successfully.
      // Thus, we are marking them as "sent".
      activity = {
        ...activity,
        channelData: {
          ...activity.channelData,
          'webchat:send-status': SENT
        }
        // TODO: Fix this.
      } as any;
    }
  }

  return activity;
}
