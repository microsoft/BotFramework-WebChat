import { type WebChatActivity } from 'botframework-webchat-core';
import { literal, object, safeParse, string } from 'valibot';

const activityWithFeedbackLoopSchema = object({
  channelData: object({
    feedbackLoop: object({
      type: literal('default'),
      disclaimer: string()
    })
  })
});

type FeedbackActivity = WebChatActivity & {
  channelData: typeof activityWithFeedbackLoopSchema;
};

export const hasFeedbackLoop = (activity: WebChatActivity): activity is FeedbackActivity =>
  safeParse(activityWithFeedbackLoopSchema, activity).success;

export const getDisclaimer = (activity: WebChatActivity): string | undefined =>
  hasFeedbackLoop(activity) ? activity.channelData.feedbackLoop.disclaimer : undefined;
