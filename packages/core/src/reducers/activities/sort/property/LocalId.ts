import type { Tagged } from 'type-fest';
import { v4 } from 'uuid';
import { object, parse, pipe, transform, type InferOutput } from 'valibot';
import type { Activity } from '../types';
import { IdentifierSchema, type Identifier } from '@msinternal/botframework-webchat-core-graph';

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

// TODO: [P1] We can use a UUID v6 (reorder). Then, we can drop `receivedAt`.
function generateLocalId(): LocalId {
  return parse(LocalIdSchema, `_:${v4()}`);
}

function generateLocalIdInActivity(activity: Readonly<Activity>): Activity {
  if (getLocalIdFromActivity(activity)) {
    throw new Error(
      'botframework-webchat: Cannot generate a new local ID for activity because the activity already has a local ID'
    );
  }

  return setLocalIdInActivity(activity, generateLocalId());
}

export { generateLocalIdInActivity, getLocalIdFromActivity, LocalIdSchema, setLocalIdInActivity, type LocalId };
