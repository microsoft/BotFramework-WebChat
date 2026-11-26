import { IdentifierSchema, type Identifier } from '@msinternal/botframework-webchat-core-graph';
import type { Tagged } from 'type-fest';
import { object, parse, pipe, safeParse, transform, type InferOutput } from 'valibot';
import type { Activity } from '../types';

const LocalIdSchema = pipe(
  IdentifierSchema,
  transform(value => value as Tagged<Identifier, 'local id'>)
);

type LocalId = InferOutput<typeof LocalIdSchema>;

const ActivityWithLocalIdSchema = object({
  channelData: object({
    'webchat:internal:local-id': LocalIdSchema
  })
});

function getLocalIdFromActivity(activity: Readonly<Activity>): LocalId {
  return parse(ActivityWithLocalIdSchema, activity).channelData['webchat:internal:local-id'];
}

function queryLocalIdFromActivity(activity: Readonly<Activity>): LocalId | undefined {
  const result = safeParse(ActivityWithLocalIdSchema, activity);

  return result.success ? result.output.channelData['webchat:internal:local-id'] : undefined;
}

function setLocalIdInActivity(activity: Readonly<Activity>, value: LocalId | undefined): Activity {
  const nextChannelData = { ...activity.channelData };

  if (typeof value === 'undefined') {
    delete (nextChannelData as any)['webchat:internal:local-id'];
  } else {
    nextChannelData['webchat:internal:local-id'] = parse(LocalIdSchema, value);
  }

  return {
    ...activity,
    channelData: nextChannelData as any
  };
}

/**
 * Sets the local ID of an activity new to the transcript. The ID comes from the action (`meta.localId`, made by
 * `prepareAction()`): the reducers do not make random values.
 */
function setNewLocalIdInActivity(activity: Readonly<Activity>, localId: LocalId): Activity {
  if (queryLocalIdFromActivity(activity)) {
    throw new Error(
      'botframework-webchat: Cannot generate a new local ID for activity because the activity already has a local ID'
    );
  }

  return setLocalIdInActivity(activity, localId);
}

export { getLocalIdFromActivity, LocalIdSchema, setLocalIdInActivity, setNewLocalIdInActivity, type LocalId };
