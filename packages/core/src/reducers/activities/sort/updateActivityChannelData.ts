import { check, parse, pipe, string, type GenericSchema } from 'valibot';
import type { Activity, ActivityInternalIdentifier, ActivityMapEntry, State } from './types';

const channelDataNameSchema: GenericSchema<
  Exclude<string, 'state' | 'streamId' | 'streamSequence' | 'streamType' | `webchat:${string}`>
> = pipe(
  string(),
  check(
    value =>
      value !== 'state' &&
      value !== 'streamId' &&
      value !== 'streamSequence' &&
      value !== 'streamType' &&
      !value.startsWith('webchat:'),
    'name must not be a reserved'
  )
);

function updateActivityChannelDataInternalSkipNameCheck(
  state: State,
  activityInternalIdentifier: ActivityInternalIdentifier,
  name: string,
  // TODO: [P*] Should we check the validity of the value?
  value: unknown
): State {
  const activityEntry = state.activityMap.get(activityInternalIdentifier);

  if (!activityEntry) {
    throw new Error(`botframework-webchat: no activity found with internal ID ${activityInternalIdentifier}`);
  }

  // TODO: [P*] Should we freeze the activity?
  const nextActivity: Activity = {
    ...activityEntry.activity,
    channelData: {
      ...activityEntry.activity.channelData,
      [name]: value
    } as any
  };

  const nextActivityMap = new Map(state.activityMap).set(
    activityInternalIdentifier,
    Object.freeze({ ...activityEntry, activity: nextActivity } satisfies ActivityMapEntry)
  );

  return Object.freeze({ ...state, activityMap: Object.freeze(nextActivityMap) } satisfies State);
}

function updateActivityChannelData(
  state: State,
  activityInternalIdentifier: ActivityInternalIdentifier,
  name: string,
  // TODO: [P*] Should we check the validity of the value?
  value: unknown
): State {
  return updateActivityChannelDataInternalSkipNameCheck(
    state,
    activityInternalIdentifier,
    parse(channelDataNameSchema, name),
    value
  );
}

export default updateActivityChannelData;
export { updateActivityChannelDataInternalSkipNameCheck };
