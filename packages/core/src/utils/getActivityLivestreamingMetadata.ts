import { integer, literal, minValue, number, object, optional, pipe, safeParse, string, union } from 'valibot';

import { type WebChatActivity } from '../types/WebChatActivity';

const streamSequenceSchema = pipe(number(), integer(), minValue(1));

const livestreamingActivitySchema = union([
  object({
    channelData: object({
      // "streamId" is optional for the very first activity in the session.
      streamId: optional(string()),
      streamSequence: streamSequenceSchema,
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
 *   - `"informative message"` - optional side-channel informative message describing the current response, e.g. "Searching your document library".
 *     Always replace past informative messages. May interleave with interim activities.
 *   - `"final activity"` - complete-and-final response, always replace past interim activities and remove all informative messages.
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

    // If the activity is the first in the session, session ID should be the activity ID.
    const sessionId = output.channelData.streamId || output.id;

    return Object.freeze(
      output.channelData.streamType === 'final'
        ? {
            sequenceNumber: Infinity,
            sessionId,
            type: 'final activity'
          }
        : {
            sequenceNumber: output.channelData.streamSequence,
            sessionId,
            type: output.channelData.streamType === 'informative' ? 'informative message' : 'interim activity'
          }
    );
  }

  return undefined;
}
