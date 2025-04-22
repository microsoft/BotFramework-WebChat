import { type WebChatActivity } from 'botframework-webchat-core';
import { literal, object, safeParse, string, type InferOutput } from 'valibot';

const activityWithFeedbackLoopSchema = object({
  channelData: object({
    feedbackLoop: object({
      disclaimer: string(),
      type: literal('default')
    })
  })
});

type FeedbackActivity = WebChatActivity & InferOutput<typeof activityWithFeedbackLoopSchema>;

export const hasFeedbackLoop = (activity: WebChatActivity): activity is FeedbackActivity =>
  safeParse(activityWithFeedbackLoopSchema, activity).success;

export const getDisclaimer = (activity: WebChatActivity): string | undefined =>
  hasFeedbackLoop(activity) ? activity.channelData.feedbackLoop.disclaimer : undefined;
