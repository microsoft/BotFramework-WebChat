import { number, object, parse, safeParse, type InferOutput } from 'valibot';
import type { Activity } from '../types';

const ReceivedAtSchema = number();

type ReceivedAt = InferOutput<typeof ReceivedAtSchema>;

const ActivityWithReceivedAtSchema = object({
  channelData: object({
    'webchat:internal:received-at': ReceivedAtSchema
  })
});

function getReceivedAtFromActivity(activity: Readonly<Activity>): ReceivedAt {
  return parse(ActivityWithReceivedAtSchema, activity).channelData['webchat:internal:received-at'];
}

function queryReceivedAtFromActivity(activity: Readonly<Activity>): ReceivedAt | undefined {
  const result = safeParse(ActivityWithReceivedAtSchema, activity);

  return result.success ? result.output.channelData['webchat:internal:received-at'] : undefined;
}

function setReceivedAtInActivity(activity: Readonly<Activity>, value: ReceivedAt | undefined): Activity {
  const nextChannelData = { ...activity.channelData };

  if (typeof value === 'undefined') {
    delete (nextChannelData as any)['webchat:internal:received-at'];
  } else {
    nextChannelData['webchat:internal:received-at'] = parse(ReceivedAtSchema, value);
  }

  return {
    ...activity,
    channelData: nextChannelData as any
  };
}

export {
  getReceivedAtFromActivity,
  queryReceivedAtFromActivity,
  ReceivedAtSchema,
  setReceivedAtInActivity,
  type ReceivedAt
};
