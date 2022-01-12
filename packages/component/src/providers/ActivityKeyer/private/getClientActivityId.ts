import type { DirectLineActivity } from 'botframework-webchat-core';

export default function getClientActivityId(activity: DirectLineActivity): string {
  return activity.channelData?.clientActivityID;
}
