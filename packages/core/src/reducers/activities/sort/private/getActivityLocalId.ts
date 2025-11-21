import type { WebChatActivity } from '../../../../types/WebChatActivity';
import type { ActivityLocalId } from '../types';

export default function getActivityLocalId(activity: WebChatActivity): ActivityLocalId {
  const activityInternalId = activity.channelData['webchat:internal:local-id'];

  if (!(typeof activityInternalId === 'string')) {
    throw new Error('botframework-webchat: Internal error, activity does not have local ID', {
      cause: { activity }
    });
  }

  return activityInternalId as ActivityLocalId;
}
