import type { DirectLineActivity } from 'botframework-webchat-core';

export default function getActivityUniqueId(activity: DirectLineActivity): string {
  return activity?.channelData?.clientActivityID || activity?.id;
}
