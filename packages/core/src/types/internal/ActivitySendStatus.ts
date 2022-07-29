import { isSelfActivity } from '../WebChatActivity';

import type { WebChatActivity } from '../WebChatActivity';

function markAsSendFailed(activity: WebChatActivity): WebChatActivity {
  if (isSelfActivity(activity)) {
    return {
      ...activity,
      channelData: {
        ...activity.channelData,
        'webchat:send-status': 'send failed'
      }
    } as WebChatActivity; // TypeScript cannot correctly infer the type.
  }

  console.warn('botframework-webchat internal: Cannot set non-self activity as send failed.');

  return activity;
}

function markAsSending(activity: WebChatActivity): WebChatActivity {
  if (isSelfActivity(activity)) {
    return {
      ...activity,
      channelData: {
        ...activity.channelData,
        'webchat:send-status': 'sending'
      }
    } as WebChatActivity; // TypeScript cannot correctly infer the type.
  }

  console.warn('botframework-webchat internal: Cannot set non-self activity as sending.');

  return activity;
}

function markAsSent(activity: WebChatActivity): WebChatActivity {
  if (isSelfActivity(activity)) {
    return {
      ...activity,
      channelData: {
        ...activity.channelData,
        'webchat:send-status': 'sent'
      }
    } as WebChatActivity; // TypeScript cannot correctly infer the type.
  }

  console.warn('botframework-webchat internal: Cannot set non-self activity as sent.');

  return activity;
}

export { markAsSendFailed, markAsSending, markAsSent };
