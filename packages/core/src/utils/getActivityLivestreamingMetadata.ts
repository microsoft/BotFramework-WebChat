import {
  any,
  array,
  findItem,
  integer,
  is,
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
  type ErrorMessage,
  type ObjectEntries,
  type ObjectIssue,
  type ObjectSchema
} from 'valibot';

import { type WebChatActivity } from '../types/WebChatActivity';
import getOrgSchemaMessage from './getOrgSchemaMessage';

const EMPTY_ARRAY = Object.freeze([]);

const streamSequenceSchema = pipe(number(), integer(), minValue(1));

function eitherChannelDataOrEntities<
  TActivityEntries extends ObjectEntries,
  TActivityMessage extends ErrorMessage<ObjectIssue> | undefined,
  TMetadataEntries extends ObjectEntries,
  TMetadataMessage extends ErrorMessage<ObjectIssue> | undefined
>(
  activitySchema: ObjectSchema<TActivityEntries, TActivityMessage>,
  metadataSchema: ObjectSchema<TMetadataEntries, TMetadataMessage>
) {
  const metadataInEntitiesSchema = object({
    ...metadataSchema.entries,
    type: literal('streaminfo')
  });

  return union([
    object({
      ...activitySchema.entries,
      channelData: metadataSchema
    }),
    pipe(
      object({
        ...activitySchema.entries,
        // We use `findItem`/`filterItem` than `variant`/`someItem` because the output of the latter is an union type.
        // Consider `{ type: string } | { streamId: string; type: 'streaminfo' }`, it turns into `{ type: string }` immediately.

        // TODO: [P2] valibot@1.1.0 did not infer output type for `filterItem()`, only infer for `findItem()`.
        //       Bump valibot@latest and see if they solved the issue.
        entities: pipe(
          array(any()),
          findItem(value => is(metadataInEntitiesSchema, value))
        )
      }),
      transform(({ entities, ...value }) => ({ ...value, streamInfoEntity: entities }))
    )
  ]);
}

const livestreamingActivitySchema = union([
  // Interim.
  eitherChannelDataOrEntities(
    object({
      attachments: optional(array(any()), EMPTY_ARRAY),
      id: string(),
      // "text" is optional. If not set or empty, it presents a contentless activity.
      text: optional(undefinedable(string())),
      type: literal('typing')
    }),
    object({
      // "streamId" is optional for the very first activity in the session.
      streamId: optional(undefinedable(string())),
      streamSequence: streamSequenceSchema,
      streamType: literal('streaming')
    })
  ),
  // Informative message.
  eitherChannelDataOrEntities(
    object({
      attachments: optional(array(any()), EMPTY_ARRAY),
      id: string(),
      // Informative may not have "text", but should have abstract instead (checked later)
      text: optional(undefinedable(string())),
      type: literal('typing'),
      entities: optional(array(any()), EMPTY_ARRAY)
    }),
    object({
      // "streamId" is optional for the very first activity in the session.
      streamId: optional(undefinedable(string())),
      streamSequence: streamSequenceSchema,
      streamType: literal('informative')
    })
  ),
  // Conclude with a message.
  eitherChannelDataOrEntities(
    object({
      attachments: optional(array(any()), EMPTY_ARRAY),
      id: string(),
      // If "text" is empty, it represents "regretting" the livestream.
      text: optional(undefinedable(string())),
      type: literal('message')
    }),
    object({
      // "streamId" is required for the final activity in the session.
      // The final activity must not be the sole activity in the session.
      streamId: pipe(string(), nonEmpty()),
      streamType: literal('final')
    })
  ),
  // Conclude without a message.
  eitherChannelDataOrEntities(
    object({
      attachments: optional(array(any()), EMPTY_ARRAY),
      id: string(),
      // If "text" is not set or empty, it represents "regretting" the livestream.
      text: optional(undefinedable(literal(''))),
      type: literal('typing')
    }),
    object({
      // "streamId" is required for the final activity in the session.
      // The final activity must not be the sole activity in the session.
      streamId: pipe(string(), nonEmpty()),
      streamType: literal('final')
    })
  )
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
  const result = safeParse(livestreamingActivitySchema, activity);

  if (result.success) {
    const { output } = result;
    const livestreamMetadata = 'channelData' in output ? output.channelData : output.streamInfoEntity;

    // If the activity is the first in the session, session ID should be the activity ID.
    const sessionId = livestreamMetadata.streamId || output.id;

    return Object.freeze(
      livestreamMetadata.streamType === 'final'
        ? {
            sequenceNumber: Infinity,
            sessionId,
            type: 'final activity'
          }
        : {
            sequenceNumber: livestreamMetadata.streamSequence,
            sessionId,
            type: !(
              output.text ||
              output.attachments?.length ||
              ('entities' in output && getOrgSchemaMessage(activity.entities)?.abstract)
            )
              ? 'contentless'
              : livestreamMetadata.streamType === 'informative'
                ? 'informative message'
                : 'interim activity'
          }
    );
  }

  return undefined;
}
