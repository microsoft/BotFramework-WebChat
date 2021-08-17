import { DirectLineActivity } from 'botframework-webchat-core';

export default function getActivityUniqueId(activity: DirectLineActivity): string {
  return activity && ((activity.channelData && activity.channelData.clientActivityID) || activity.id);
}
