import { type WebChatActivity } from 'botframework-webchat-core';

type ActivityType = 'event' | 'message';

type FeedbackActivity<T extends ActivityType> = WebChatActivity & {
  type: T;
  channelData: {
    feedbackLoop: {
      type: 'default';
      disclaimer?: string | undefined;
    };
  };
};

export const isDefaultFeedbackActivity = (activity: WebChatActivity): activity is FeedbackActivity<ActivityType> => {
  if (
    (activity.type === 'message' || activity.type === 'event') &&
    activity.channelData.feedbackLoop?.type === 'default'
  ) {
    return true;
  }

  return false;
};
