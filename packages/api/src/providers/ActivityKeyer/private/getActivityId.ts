import type { DirectLineActivity } from 'botframework-webchat-core';

export default function getActivityId(activity: DirectLineActivity): string {
  return activity.id;
}
