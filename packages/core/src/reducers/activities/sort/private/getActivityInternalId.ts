import type { WebChatActivity } from '../../../../types/WebChatActivity';
import type { ActivityInternalIdentifier } from '../types';

export default function getActivityInternalId(activity: WebChatActivity): ActivityInternalIdentifier {
  const activityInternalId = activity.channelData['webchat:internal:id'];

  if (!(typeof activityInternalId === 'string')) {
    throw new Error('botframework-webchat: Internal error, activity does not have internal ID', {
      cause: { activity }
    });
  }

  return activityInternalId as ActivityInternalIdentifier;
}
