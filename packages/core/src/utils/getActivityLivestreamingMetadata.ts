import {
  any,
  array,
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
  undefinedable,
  union
} from 'valibot';

import { type WebChatActivity } from '../types/WebChatActivity';
import getOrgSchemaMessage from './getOrgSchemaMessage';

const EMPTY_ARRAY = Object.freeze([]);

const streamSequenceSchema = pipe(number(), integer(), minValue(1));

const streamingDataSchema = object({
  streamId: optional(undefinedable(string())),
  streamSequence: optional(streamSequenceSchema),
  streamType: union([literal('streaming'), literal('informative'), literal('final')]),
  type: optional(string())
});

const channelDataStreamingActivitySchema = union([
  // Interim.
  object({
    attachments: optional(array(any()), EMPTY_ARRAY),
    channelData: object({
      // "streamId" is optional for the very first activity in the session.
      streamId: optional(undefinedable(string())),
      streamSequence: streamSequenceSchema,
      streamType: literal('streaming')
    }),
    id: string(),
    // "text" is optional. If not set or empty, it presents a contentless activity.
    text: optional(undefinedable(string())),
    type: literal('typing'),
    entities: optional(array(any()), EMPTY_ARRAY)
  }),
  // Informative message.
  object({
    attachments: optional(array(any()), EMPTY_ARRAY),
    channelData: object({
      // "streamId" is optional for the very first activity in the session.
      streamId: optional(undefinedable(string())),
      streamSequence: streamSequenceSchema,
      streamType: literal('informative')
    }),
    id: string(),
    // Informative may not have "text", but should have abstract instead (checked later)
    text: optional(undefinedable(string())),
    type: literal('typing'),
    entities: optional(array(any()), EMPTY_ARRAY)
  }),
  // Conclude with a message.
  object({
    attachments: optional(array(any()), EMPTY_ARRAY),
    channelData: object({
      // "streamId" is required for the final activity in the session.
      // The final activity must not be the sole activity in the session.
      streamId: pipe(string(), nonEmpty()),
      streamType: literal('final')
    }),
    id: string(),
    // If "text" is empty, it represents "regretting" the livestream.
    text: optional(undefinedable(string())),
    type: literal('message'),
    entities: optional(array(any()), EMPTY_ARRAY)
  }),
  // Conclude without a message.
  object({
    attachments: optional(array(any()), EMPTY_ARRAY),
    channelData: object({
      // "streamId" is required for the final activity in the session.
      // The final activity must not be the sole activity in the session.
      streamId: pipe(string(), nonEmpty()),
      streamType: literal('final')
    }),
    id: string(),
    // If "text" is not set or empty, it represents "regretting" the livestream.
    text: optional(undefinedable(literal(''))),
    type: literal('typing'),
    entities: optional(array(any()), EMPTY_ARRAY)
  })
]);

const entitiesStreamingActivitySchema = union([
  // Same thing but for entities
  object({
    attachments: optional(array(any()), EMPTY_ARRAY),
    entities: array(
      object({
        // "streamId" is optional for the very first activity in the session.
        streamId: optional(undefinedable(string())),
        streamSequence: streamSequenceSchema,
        streamType: literal('streaming')
      })
    ),
    channelData: any(),
    id: string(),
    // "text" is optional. If not set or empty, it presents a contentless activity.
    text: optional(undefinedable(string())),
    type: literal('typing')
  }),
  // Informative message.
  object({
    attachments: optional(array(any()), EMPTY_ARRAY),
    entities: array(
      object({
        // "streamId" is optional for the very first activity in the session.
        streamId: optional(undefinedable(string())),
        streamSequence: streamSequenceSchema,
        streamType: literal('informative')
      })
    ),
    channelData: any(),
    id: string(),
    // Informative may not have "text", but should have abstract instead (checked later)
    text: optional(undefinedable(string())),
    type: literal('typing')
  }),
  // Conclude with a message.
  object({
    attachments: optional(array(any()), EMPTY_ARRAY),
    entities: array(
      object({
        // "streamId" is required for the final activity in the session.
        // The final activity must not be the sole activity in the session.
        streamId: pipe(string(), nonEmpty()),
        streamType: literal('final')
      })
    ),
    channelData: any(),
    id: string(),
    // If "text" is empty, it represents "regretting" the livestream.
    text: optional(undefinedable(string())),
    type: literal('message')
  }),
  // Conclude without a message.
  object({
    attachments: optional(array(any()), EMPTY_ARRAY),
    entities: array(
      object({
        // "streamId" is required for the final activity in the session.
        // The final activity must not be the sole activity in the session.
        streamId: pipe(string(), nonEmpty()),
        streamType: literal('final')
      })
    ),
    channelData: any(),
    id: string(),
    // If "text" is not set or empty, it represents "regretting" the livestream.
    text: optional(undefinedable(literal(''))),
    type: literal('typing')
  })
]);

/**
 * Gets the livestreaming metadata of the activity, or `undefined` if the activity is not participating in a livestreaming session.
 *
 * - `sessionId` - ID of the livestreaming session
 * - `sequenceNumber` - sequence number of the activity
 * - `type`
 *   - `"contentless"` - ongoing but no content, should show indicator
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
      type: 'contentless' | 'final activity' | 'informative message' | 'interim activity';
    }>
  | undefined {
  let activityResult: any;
  let streamingDataResult: any;

  if (activity.entities) {
    activityResult = safeParse(entitiesStreamingActivitySchema, activity);
    streamingDataResult = safeParse(streamingDataSchema, activity.entities[0]);
  }

  if (!(activityResult?.success && streamingDataResult?.success) && activity.channelData) {
    activityResult = safeParse(channelDataStreamingActivitySchema, activity);
    streamingDataResult = safeParse(streamingDataSchema, activity.channelData);
  }

  if (activityResult?.success && streamingDataResult?.success) {
    const { output } = activityResult;
    const { output: streamData } = streamingDataResult;

    // If the activity is the first in the session, session ID should be the activity ID.
    const sessionId = streamData.streamId || output.id;

    return Object.freeze(
      streamData.streamType === 'final'
        ? {
            sequenceNumber: Infinity,
            sessionId,
            type: 'final activity'
          }
        : {
            sequenceNumber: streamData.streamSequence,
            sessionId,
            type: !(
              output.text ||
              output.attachments?.length ||
              ('entities' in output && getOrgSchemaMessage(output.entities)?.citation)
            )
              ? 'contentless'
              : streamData.streamType === 'informative'
                ? 'informative message'
                : 'interim activity'
          }
    );
  }

  return undefined;
}
