import { __INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol } from 'botframework-webchat-api/internal';
import { avatarComponent, createAvatarPolymiddleware } from 'botframework-webchat-api/middleware';
import DefaultAvatar from './DefaultAvatar';

const defaultAvatarMiddleware = createAvatarPolymiddleware(
  _next =>
    ({
      fromUser,
      [__INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol]: {
        botAvatarImage,
        botAvatarInitials,
        userAvatarImage,
        userAvatarInitials
      }
    }) =>
      (fromUser ? userAvatarImage || userAvatarInitials : botAvatarImage || botAvatarInitials)
        ? avatarComponent(DefaultAvatar, Object.freeze({ fromUser }))
        : undefined
);

export default defaultAvatarMiddleware;
