import {
  array,
  integer,
  is,
  literal,
  looseObject,
  minValue,
  nonEmpty,
  number,
  object,
  optional,
  pipe,
  safeParse,
  string,
  undefinedable,
  union,
  unknown,
  type InferOutput
} from 'valibot';
import type { DirectLineActivity } from './DirectLineActivity.ts';
import getSelfMessage from './getSelfMessage.ts';

type LivestreamingMetadata = {
  readonly sequenceNumber: number;
  readonly sessionId: string;
  readonly type: 'contentless' | 'final activity' | 'informative message' | 'interim activity';
};

const streamSequenceSchema = pipe(number(), integer(), minValue(1));

const ongoingMetadataSchema = object({
  // "streamId" is optional for the very first activity in the session.
  streamId: optional(undefinedable(string())),
  streamSequence: streamSequenceSchema,
  streamType: union([literal('informative'), literal('streaming')])
});

const finalMetadataSchema = object({
  // "streamId" is required for the final activity in the session.
  // The final activity must not be the sole activity in the session.
  streamId: pipe(string(), nonEmpty()),
  streamType: literal('final')
});

const metadataSchema = union([ongoingMetadataSchema, finalMetadataSchema]);

const livestreamingActivitySchema = union([
  // Interim, informative, or conclude without a message.
  looseObject({
    attachments: optional(array(unknown())),
    id: string(),
    text: optional(string()),
    type: literal('typing')
  }),
  // Conclude with a message.
  looseObject({
    attachments: optional(array(unknown())),
    id: string(),
    text: optional(string()),
    type: literal('message')
  })
]);

const streamInfoEntitySchema = looseObject({
  ...ongoingMetadataSchema.entries,
  type: literal('streaminfo')
});

const finalStreamInfoEntitySchema = looseObject({
  ...finalMetadataSchema.entries,
  type: literal('streaminfo')
});

/**
 * Gets the metadata from either `channelData` or the `streaminfo` entity.
 */
function getMetadata(activity: DirectLineActivity): InferOutput<typeof metadataSchema> | undefined {
  const channelDataResult = safeParse(metadataSchema, activity.channelData);

  if (channelDataResult.success) {
    return channelDataResult.output;
  }

  const entity = activity.entities?.find(
    entity => is(streamInfoEntitySchema, entity) || is(finalStreamInfoEntitySchema, entity)
  );

  const entityResult = safeParse(metadataSchema, entity);

  return entityResult.success ? entityResult.output : undefined;
}

/**
 * Gets the livestreaming metadata of the activity, or `undefined` if the activity is not participating in a
 * livestreaming session, see `getActivityLivestreamingMetadata()` of `botframework-webchat-core`.
 *
 * - `sessionId` - ID of the livestreaming session
 * - `sequenceNumber` - sequence number of the activity, `Infinity` for the final activity
 * - `type`
 *   - `"contentless"` - ongoing but no content, should show indicator
 *   - `"interim activity"` - current response, more activities are expected
 *   - `"informative message"` - optional side-channel informative message describing the current response
 *   - `"final activity"` - complete-and-final response, this activity indicates end of the session
 */
function getLivestreamingMetadata(activity: DirectLineActivity): LivestreamingMetadata | undefined {
  const activityResult = safeParse(livestreamingActivitySchema, activity);

  if (!activityResult.success) {
    return undefined;
  }

  const { output } = activityResult;
  const metadata = getMetadata(activity);

  if (!metadata) {
    return undefined;
  }

  // If the activity is the first in the session, session ID should be the activity ID.
  const sessionId = metadata.streamId || output.id;

  if (metadata.streamType === 'final') {
    // Conclude without a message, "text" must not be set or empty.
    return output.type === 'typing' && output.text
      ? undefined
      : Object.freeze({ sequenceNumber: Infinity, sessionId, type: 'final activity' });
  }

  // Ongoing revision must be a typing activity.
  if (output.type !== 'typing') {
    return undefined;
  }

  return Object.freeze({
    sequenceNumber: metadata.streamSequence,
    sessionId,
    type: !(output.text || output.attachments?.length || getSelfMessage(activity.entities)?.abstract[0])
      ? 'contentless'
      : metadata.streamType === 'informative'
        ? 'informative message'
        : 'interim activity'
  });
}

export default getLivestreamingMetadata;
export { type LivestreamingMetadata };
