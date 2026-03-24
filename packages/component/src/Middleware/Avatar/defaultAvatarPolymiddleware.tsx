import { __INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol } from 'botframework-webchat-api/internal';
import { avatarComponent, createAvatarPolymiddleware } from 'botframework-webchat-api/middleware';
import DefaultAvatar from './DefaultAvatar';

const defaultAvatarMiddleware = createAvatarPolymiddleware(
  _next =>
    ({
      activity,
      [__INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol]: {
        botAvatarImage,
        botAvatarInitials,
        userAvatarImage,
        userAvatarInitials
      }
    }) => {
      const fromUser = activity.from?.role === 'user';

      return (fromUser ? userAvatarImage || userAvatarInitials : botAvatarImage || botAvatarInitials)
        ? avatarComponent(DefaultAvatar, Object.freeze({ fromUser }))
        : undefined;
    }
);

export default defaultAvatarMiddleware;
