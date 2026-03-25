import type { StyleOptions } from 'botframework-webchat-api';
import { avatarComponent, createAvatarPolymiddleware } from 'botframework-webchat-api/middleware';
import DefaultAvatar from './DefaultAvatar';

function createDefaultAvatarMiddleware(styleOptions: StyleOptions | undefined) {
  const { botAvatarImage, botAvatarInitials, userAvatarImage, userAvatarInitials } = styleOptions ?? {};

  return createAvatarPolymiddleware(_next => ({ activity }) => {
    const fromUser = activity.from?.role === 'user';

    return (fromUser ? userAvatarImage || userAvatarInitials : botAvatarImage || botAvatarInitials)
      ? avatarComponent(DefaultAvatar, Object.freeze({ fromUser }))
      : undefined;
  });
}

export default createDefaultAvatarMiddleware;
