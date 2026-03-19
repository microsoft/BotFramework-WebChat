// TODO: This is moved from /api, need to revisit/rewrite everything in this file.
import { type WebChatActivity } from 'botframework-webchat-core';
import { type ReactNode } from 'react';

type LegacyAvatarComponentFactoryArguments = {
  readonly activity: WebChatActivity;
  readonly fromUser: boolean;
  readonly styleOptions: Readonly<Record<string, unknown>>;
};

type LegacyAvatarRenderer = false | (() => Exclude<ReactNode, boolean | null | undefined>);

type LegacyAvatarEnhancer = (
  next: (args: LegacyAvatarComponentFactoryArguments) => LegacyAvatarRenderer
) => (args: LegacyAvatarComponentFactoryArguments) => LegacyAvatarRenderer;

type LegacyAvatarMiddleware = () => LegacyAvatarEnhancer;

export type { LegacyAvatarMiddleware, LegacyAvatarRenderer };
