import { number, object, parse, safeParse, type InferOutput } from 'valibot';
import type { Activity } from '../types';

const PositionSchema = number('position must be a number');

type Position = InferOutput<typeof PositionSchema>;

const ActivityWithPositionSchema = object({
  channelData: object({
    'webchat:internal:position': PositionSchema
  })
});

function getPositionFromActivity(activity: Readonly<Activity>): Position {
  return parse(ActivityWithPositionSchema, activity).channelData['webchat:internal:position'];
}

function queryPositionFromActivity(activity: Readonly<Activity>): Position | undefined {
  const result = safeParse(ActivityWithPositionSchema, activity);

  return result.success ? result.output.channelData['webchat:internal:position'] : undefined;
}

function setPositionInActivity(activity: Readonly<Activity>, value: Position | undefined): Activity {
  const nextChannelData = { ...activity.channelData };

  if (typeof value === 'undefined') {
    delete (nextChannelData as any)['webchat:internal:position'];
  } else {
    nextChannelData['webchat:internal:position'] = parse(PositionSchema, value);
  }

  return {
    ...activity,
    channelData: nextChannelData as any
  };
}

export { getPositionFromActivity, PositionSchema, queryPositionFromActivity, setPositionInActivity, type Position };
