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

export default function hasFeedbackLoop(activity: WebChatActivity): activity is FeedbackActivity {
  return safeParse(activityWithFeedbackLoopSchema, activity).success;
}
