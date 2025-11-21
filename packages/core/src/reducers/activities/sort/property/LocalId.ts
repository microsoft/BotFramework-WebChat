import type { Tagged } from 'type-fest';
import { v4 } from 'uuid';
import { object, parse, pipe, string, transform, type InferOutput } from 'valibot';
import type { Activity } from '../types';

const LocalIdSchema = pipe(
  string('Local ID must be a string'),
  transform(value => value as Tagged<string, 'local id'>)
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

function generateLocalId(): LocalId {
  return v4() as LocalId;
}

export { generateLocalId, getLocalIdFromActivity, LocalIdSchema, setLocalIdInActivity, type LocalId };
