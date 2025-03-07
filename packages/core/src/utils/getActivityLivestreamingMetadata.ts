import {
  integer,
  literal,
  minValue,
  nonEmpty,
  number,
  object,
  optional,
  pipe,
  safeParse,
  string,
  union
} from 'valibot';

import { type WebChatActivity } from '../types/WebChatActivity';

const streamSequenceSchema = pipe(number(), integer(), minValue(1));

const livestreamingActivitySchema = union([
  // Interim can have optional "text".
  object({
    channelData: object({
      // "streamId" is optional for the very first activity in the session.
      streamId: optional(string()),
      streamSequence: streamSequenceSchema,
      streamType: literal('streaming')
    }),
    id: string(),
    text: optional(string()),
    type: literal('typing')
  }),
  // Informative must have a "text".
  object({
    channelData: object({
      // "streamId" is optional for the very first activity in the session.
      streamId: optional(string()),
      streamSequence: streamSequenceSchema,
      streamType: literal('informative')
    }),
    id: string(),
    text: string(),
    type: literal('typing')
  }),
  // Final with a message.
  object({
    channelData: object({
      // "streamId" is required for the final activity in the session. The final activity must not be the sole activity in the session.
      streamId: pipe(string(), nonEmpty()),
      streamType: literal('final')
    }),
    id: string(),
    text: string(),
    type: literal('message')
  }),
  // Final without a message.
  object({
    channelData: object({
      // "streamId" is required for the final activity in the session. The final activity must not be the sole activity in the session.
      streamId: pipe(string(), nonEmpty()),
      streamType: literal('final')
    }),
    id: string(),
    text: optional(literal('')), // "text" field must be empty or undefined.
    type: literal('typing')
  })
]);

/**
 * Gets the livestreaming metadata of the activity, or `undefined` if the activity is not participating in a livestreaming session.
 *
 * - `sessionId` - ID of the livestreaming session
 * - `sequenceNumber` - sequence number of the activity
 * - `type`
 *   - `"indicator only"` - ongoing but empty response, should show indicator only
 *   - `"interim activity"` - current response, could be partial-from-start, or complete response.
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
      type: 'final activity' | 'informative message' | 'interim activity' | 'indicator only';
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
            type: !output.text
              ? 'indicator only'
              : output.channelData.streamType === 'informative'
                ? 'informative message'
                : 'interim activity'
          }
    );
  }

  return undefined;
}
