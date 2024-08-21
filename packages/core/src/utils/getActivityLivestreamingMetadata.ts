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
    id: string(),
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
    id: string(),
    text: string(),
    type: literal('message')
  })
]);

/**
 * Gets the livestreaming metadata of the activity, or `undefined` if the activity is not participating in a livestreaming session.
 *
 * - `sessionId` - ID of the livestreaming session
 * - `sequenceNumber` - sequence number of the activity
 * - `type`
 *   - `"interim activity"` - current response, could be empty, partial-from-start, or complete response.
 *     More activities are expected. Future interim activities always replace past interim activities, enable erasing or backtracking response.
 *   - `"informative message"` - optional sidechannel informative message describing the current response, e.g. "Searching your document library".
 *     Always replace past informative messages. May interleave with interim activities.
 *   - `"final activity"` - complete-and-ending response, always replace past interim activities and past informative messages.
 *     This activity indicates end of the session, all future activities must be ignored.
 *   - `undefined` - not part of a livestream session or the activity is not valid
 *
 * @returns {object} Livestreaming metadata of the activity, or `undefined` if the activity is not participating in a livestreaming session.
 */
export default function getActivityLivestreamingMetadata(activity: WebChatActivity):
  | Readonly<{
      sessionId: string;
      sequenceNumber: number;
      type: 'final activity' | 'informative message' | 'interim activity';
    }>
  | undefined {
  const result = safeParse(livestreamingActivitySchema, activity);

  if (result.success) {
    const { output } = result;
    const {
      channelData: { streamType }
    } = output;

    const sessionId = output.channelData.streamId || output.id;

    const type =
      streamType === 'final'
        ? 'final activity'
        : streamType === 'informative'
          ? 'informative message'
          : 'interim activity';

    return Object.freeze({
      sessionId,
      sequenceNumber: output.channelData.streamSequence,
      type
    });
  }

  return undefined;
}
