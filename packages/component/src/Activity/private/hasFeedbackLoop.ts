import { type WebChatActivity } from 'botframework-webchat-core';
import { literal, string, object, safeParse, type InferOutput, nullish } from 'valibot';

const activityWithFeedbackLoopSchemaWithDisclaimer = object({
  channelData: object({
    feedbackLoop: object({
      disclaimer: optional(string()),
      type: literal('default')
    })
  })
});

const activityWithFeedbackLoopSchemaWithOutDisclaimer = object({
  channelData: object({
    feedbackLoop: object({
      type: literal('default')
    })
  })
});

type FeedbackActivityWithDisclaimer = WebChatActivity &
  InferOutput<typeof activityWithFeedbackLoopSchemaWithDisclaimer>;

type FeedbackActivityWithoutDisclaimer = WebChatActivity &
  InferOutput<typeof activityWithFeedbackLoopSchemaWithOutDisclaimer>;

type FeedbackActivity = FeedbackActivityWithDisclaimer | FeedbackActivityWithoutDisclaimer;

export function hasDisclaimer(activity: WebChatActivity): activity is FeedbackActivityWithDisclaimer {
  return safeParse(activityWithFeedbackLoopSchemaWithDisclaimer, activity).success;
}

export default function hasFeedbackLoop(activity: WebChatActivity): activity is FeedbackActivity {
  return safeParse(activityWithFeedbackLoopSchemaWithOutDisclaimer, activity).success;
}
