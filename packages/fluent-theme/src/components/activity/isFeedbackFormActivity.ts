import { type WebChatActivity } from 'botframework-webchat-core';

export type FeedbackFormActivity = WebChatActivity & {
  type: 'event';
  name: 'webchat:activity-status/feedback';
  channelData: {
    feedbackLoop: { type: 'default' };
  };
};

export default function isFeedbackFormActivity(
  activity: undefined | WebChatActivity
): activity is FeedbackFormActivity {
  return !!(
    activity &&
    activity.type === 'event' &&
    activity.name === 'webchat:activity-status/feedback' &&
    (activity.channelData as any)?.feedbackLoop?.type === 'default'
  );
}
