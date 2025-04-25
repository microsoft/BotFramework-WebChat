import { type WebChatActivity } from 'botframework-webchat-core';
import { literal, string, object, safeParse, type InferOutput, looseObject } from 'valibot';

const activityWithFeedbackLoopSchema = object({
  channelData: object({
    feedbackLoop: looseObject({
      disclaimer: string(),
      type: literal('default')
    })
  })
});

type FeedbackActivity = WebChatActivity & InferOutput<typeof activityWithFeedbackLoopSchema>;

export default function hasFeedbackLoop(activity: WebChatActivity): activity is FeedbackActivity {
  return safeParse(activityWithFeedbackLoopSchema, activity).success;
}
