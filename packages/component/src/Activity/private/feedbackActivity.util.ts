import { type WebChatActivity } from 'botframework-webchat-core';
import { object, safeParse, string } from 'valibot';

const activityWithFeedbackLoopSchema = object({
  channelData: object({
    feedbackLoop: object({
      type: string(),
      disclaimer: string()
    })
  })
});

type FeedbackActivity = WebChatActivity & {
  channelData: typeof activityWithFeedbackLoopSchema;
};

export const hasFeedbackLoop = (activity: WebChatActivity): activity is FeedbackActivity =>
  safeParse(activityWithFeedbackLoopSchema, activity.channelData).success;

export const getDisclaimer = (activity: WebChatActivity): string | undefined =>
  hasFeedbackLoop(activity) ? activity.channelData.feedbackLoop.disclaimer : undefined;
