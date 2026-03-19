// TODO: This is moved from /api, need to revisit/rewrite everything in this file.
import { type WebChatActivity } from 'botframework-webchat-core';
import { type ReactNode } from 'react';
import type { AvatarPolymiddlewareRequest } from '../avatarPolymiddleware';

// Polymiddleware requires immutable request object.
// When bridging between legacy and polymiddlware, this symbol helps keeping the original object.
const __INTERNAL_DO_NOT_USE__legacyAvatarMiddlewareOriginalRequestSymbol = Symbol();

type LegacyAvatarComponentFactoryArguments = {
  readonly [__INTERNAL_DO_NOT_USE__legacyAvatarMiddlewareOriginalRequestSymbol]: AvatarPolymiddlewareRequest;
  readonly activity: WebChatActivity;
  readonly fromUser: boolean;
  readonly styleOptions: Readonly<Record<string, unknown>>;
};

type LegacyAvatarRenderer = false | (() => Exclude<ReactNode, boolean | null | undefined>);

type LegacyAvatarEnhancer = (
  next: (args: LegacyAvatarComponentFactoryArguments) => LegacyAvatarRenderer
) => (args: LegacyAvatarComponentFactoryArguments) => LegacyAvatarRenderer;

type LegacyAvatarMiddleware = () => LegacyAvatarEnhancer;

export {
  __INTERNAL_DO_NOT_USE__legacyAvatarMiddlewareOriginalRequestSymbol,
  type LegacyAvatarMiddleware,
  type LegacyAvatarRenderer
};
