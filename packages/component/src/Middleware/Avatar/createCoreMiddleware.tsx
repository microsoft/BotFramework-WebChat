import { __INTERNAL_DO_NOT_USE__avatarPolymiddlewareRequestStyleOptionsSymbol } from 'botframework-webchat-api/internal';
import {
  avatarComponent,
  createAvatarPolymiddleware,
  type AvatarPolymiddleware
} from 'botframework-webchat-api/middleware';
import DefaultAvatar from './DefaultAvatar';

export default function createDefaultAvatarMiddleware(): readonly AvatarPolymiddleware[] {
  return Object.freeze([
    createAvatarPolymiddleware(
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
    )
  ]);
}
