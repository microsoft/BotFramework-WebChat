import { type DirectLineActivity, type WebChatActivity } from 'botframework-webchat-core';

export default function createPatchActivityFactory(userID: string) {
  return function patchActivity(activity: DirectLineActivity): Readonly<WebChatActivity> {
    const { from } = activity;

    const fromId = from?.id;
    const fromRole = from?.role;

    const webChatActivity = {
      ...activity,
      attachmentLayout: activity.attachmentLayout ?? undefined,
      attachments: Array.isArray(activity.attachments) ? activity.attachments : [],
      channelData: { ...(typeof activity.channelData !== 'string' ? activity.channelData : {}) },
      conversation: activity.conversation ?? undefined,
      entities: activity.entities ?? undefined,
      from: {
        ...activity.from,
        role: fromRole || (fromId === userID ? 'user' : fromId ? 'bot' : 'channel')
      },
      inputHint: activity.inputHint ?? undefined,
      locale: activity.locale ?? undefined,
      name: activity.name ?? undefined,
      recipient: activity.recipient ?? undefined,
      speak: activity.speak ?? undefined,
      suggestedActions: activity.suggestedActions ?? undefined,
      text: activity.text ?? undefined,
      textFormat: activity.textFormat ?? undefined,
      timestamp: activity.timestamp ?? undefined,
      type: activity.type ?? undefined
    };

    return Object.freeze(webChatActivity);
  };
}
