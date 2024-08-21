import { literal, number, object, optional, safeParse, string, union } from 'valibot';

import { type WebChatActivity } from '../types/WebChatActivity';

const livestreamingActivitySchema = union([
  object({
    channelData: object({
      // "streamId" is optional for the very first activity in the session.
      streamId: optional(string()),
      streamSequence: number(),
      streamType: union([literal('informative'), literal('streaming')])
    }),
    text: string(),
    type: literal('typing')
  }),
  object({
    channelData: object({
      // "streamId" is required for the final activity in the session. The final activity must not be the sole activity in the session.
      streamId: string(),
      streamSequence: number(),
      streamType: literal('final')
    }),
    text: string(),
    type: literal('message')
  })
]);

/**
 * Determines the type of the activity in the livestreaming session.
 *
 * - `"interim activity"` - current response, could be empty, partial-from-start, or complete response.
 *   More activities are expected. Future interim activities always replace past interim activities, enable erasing or backtracking response.
 * - `"informative message"` - optional sidechannel informative message describing the current response, e.g. "Searching your document library".
 *   Always replace past informative messages. May interleave with interim activities.
 * - `"final activity"` - complete-and-ending response, always replace past interim activities and past informative messages.
 *   This activity indicates end of the session, all future activities must be ignored.
 * - `undefined` - not part of a livestream session or the activity is not valid
 *
 * @returns {("final activity" | "informative message" | "interim activity" | undefined)} Type of the activity in the livestreaming session.
 */
export default function getActivityLivestreamingType(
  activity: WebChatActivity
): 'final activity' | 'informative message' | 'interim activity' | undefined {
  const result = safeParse(livestreamingActivitySchema, activity);

  // eslint-disable-next-line default-case
  switch (result.success && result.output.channelData.streamType) {
    case 'final':
      return 'final activity';

    case 'informative':
      return 'informative message';

    case 'streaming':
      return 'interim activity';
  }

  return undefined;
}
