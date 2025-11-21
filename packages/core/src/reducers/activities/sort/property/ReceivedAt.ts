import { number, object, parse, type InferOutput } from 'valibot';
import type { Activity } from '../types';

const ReceivedAtSchema = number();

type ReceivedAt = InferOutput<typeof ReceivedAtSchema>;

const ActivityWithReceivedAtSchema = object({
  channelData: object({
    'webchat:received-at': ReceivedAtSchema
  })
});

function getReceivedAtFromActivity(activity: Readonly<Activity>): ReceivedAt {
  return parse(ActivityWithReceivedAtSchema, activity).channelData['webchat:received-at'];
}

function setReceivedAtInActivity(activity: Readonly<Activity>, value: ReceivedAt | undefined): Activity {
  const nextChannelData = { ...activity.channelData };

  if (typeof value === 'undefined') {
    delete (nextChannelData as any)['webchat:received-at'];
  } else {
    nextChannelData['webchat:received-at'] = parse(ReceivedAtSchema, value);
  }

  return {
    ...activity,
    channelData: nextChannelData as any
  };
}

export { getReceivedAtFromActivity, ReceivedAtSchema, setReceivedAtInActivity, type ReceivedAt };
