import { object, parse, picklist, safeParse, type InferOutput } from 'valibot';
import type { Activity } from '../types';

const SendStatusSchema = picklist(
  ['sending', 'send failed', 'sent'],
  'Send status must be either "sending", "send failed" or "sent"'
);

type SendStatus = InferOutput<typeof SendStatusSchema>;

const OutgoingActivityWithSendStatusSchema = object({
  channelData: object(
    {
      'webchat:send-status': SendStatusSchema
    },
    '"channelData" must be an object'
  )
});

function getSendStatusFromOutgoingActivity(activity: Activity): SendStatus {
  return parse(OutgoingActivityWithSendStatusSchema, activity).channelData['webchat:send-status'];
}

function querySendStatusFromOutgoingActivity(activity: Activity): SendStatus | undefined {
  const result = safeParse(OutgoingActivityWithSendStatusSchema, activity);

  return result.success ? result.output.channelData['webchat:send-status'] : undefined;
}

function setSendStatusInOutgoingActivity(activity: Activity, value: SendStatus | undefined): Activity {
  const nextChannelData = { ...activity.channelData };

  if (typeof value === 'undefined') {
    delete (nextChannelData as any)['webchat:send-status'];
  } else {
    nextChannelData['webchat:send-status'] = value;
  }

  return {
    ...activity,
    channelData: nextChannelData as any
  };
}

export {
  getSendStatusFromOutgoingActivity,
  querySendStatusFromOutgoingActivity,
  SendStatusSchema,
  setSendStatusInOutgoingActivity,
  type SendStatus
};
