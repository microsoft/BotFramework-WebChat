import {
  any,
  array,
  empty,
  integer,
  length,
  literal,
  minValue,
  nonEmpty,
  number,
  object,
  optional,
  pipe,
  safeParse,
  string,
  transform,
  undefinedable,
  union,
  unknown
} from 'valibot';

import { type WebChatActivity } from '../types/WebChatActivity';
import getOrgSchemaMessage from './getOrgSchemaMessage';

const EMPTY_ARRAY = Object.freeze([]);

type StreamData = {
  streamId?: string;
  streamSequence?: number;
  streamType?: string;
};

const streamSequenceSchema = pipe(number(), integer(), minValue(1));

const streamInfoSchema = union([
  object({
    // "streamId" is optional for the very first activity in the session.
    streamId: optional(undefinedable(string())),
    streamSequence: streamSequenceSchema,
    streamType: union([literal('streaming'), literal('informative')])
  }),
  object({
    // "streamId" is required for the final activity in the session.
    // The final activity must not be the sole activity in the session.
    streamId: pipe(string(), nonEmpty()),
    streamType: literal('final')
  })
]);

const validEntitiesSchema = union([
  pipe(
    array(streamInfoSchema),
    length(1),
    transform(data => data[0])
  ),
  pipe(
    array(unknown()),
    empty(),
    transform(() => undefined)
  )
]);

const validChannelDataSchema = union([
  streamInfoSchema,
  pipe(
    object({
      webChat: object({
        receivedAt: number()
      })
    }),
    transform(() => undefined)
  )
]);

const livestreamingActivitySchema = object({
  entities: validEntitiesSchema,
  channelData: validChannelDataSchema,
  attachments: optional(array(any()), EMPTY_ARRAY),
  id: string(),
  text: optional(undefinedable(string())),
  type: union([literal('typing'), literal('message')])
});

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
  const result = safeParse(livestreamingActivitySchema, activity);

  if (result.success) {
    const { output } = result;

    let streamData: StreamData;

    if (output.entities !== undefined) {
      streamData = output.entities;
    } else if (output.channelData !== undefined) {
      streamData = output.channelData;
    } else {
      return undefined;
    }

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
              ('entities' in output && getOrgSchemaMessage(output.entities)?.abstract)
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
