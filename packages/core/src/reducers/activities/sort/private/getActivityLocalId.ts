import type { WebChatActivity } from '../../../../types/WebChatActivity';
import type { ActivityLocalId } from '../types';

export default function getActivityLocalId(activity: WebChatActivity): ActivityLocalId {
  const localId = activity.channelData['webchat:internal:local-id'];

  if (!(typeof localId === 'string')) {
    throw new Error('botframework-webchat: Internal error, activity does not have local ID', {
      cause: { activity }
    });
  }

  return localId as ActivityLocalId;
}
