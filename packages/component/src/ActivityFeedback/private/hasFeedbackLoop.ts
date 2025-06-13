import { type WebChatActivity } from 'botframework-webchat-core';
import { literal, object, optional, safeParse, string, union, type InferOutput } from 'valibot';

const activityWithFeedbackLoopSchemaWithDisclaimer = object({
  channelData: object({
    feedbackLoop: object({
      disclaimer: optional(string()),
      type: literal('default')
    })
  })
});

const activityWithFeedbackLoopSchemaWithoutDisclaimer = object({
  channelData: object({
    feedbackLoop: object({
      type: literal('default')
    })
  })
});

const feedbackLoopSchema = union([
  activityWithFeedbackLoopSchemaWithDisclaimer,
  activityWithFeedbackLoopSchemaWithoutDisclaimer
]);

type FeedbackActivity = WebChatActivity & InferOutput<typeof feedbackLoopSchema>;

/**
 * @deprecated This helper function should only use for patching the service. After patching, should use `getDisclaimerFormReviewAction` instead.
 */
export function hasDisclaimer(
  activity: WebChatActivity
): activity is WebChatActivity & InferOutput<typeof activityWithFeedbackLoopSchemaWithDisclaimer> {
  return safeParse(activityWithFeedbackLoopSchemaWithDisclaimer, activity).success;
}

/**
 * @deprecated This helper function should only use for patching the service. After patching, should use `isActionRequireReview` instead.
 */
export default function hasFeedbackLoop(activity: WebChatActivity): activity is FeedbackActivity {
  return safeParse(feedbackLoopSchema, activity).success;
}
