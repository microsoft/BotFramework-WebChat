// TODO: This is moved from /api, need to revisit/rewrite everything in this file.
import { type WebChatActivity } from 'botframework-webchat-core';
import { type ReactNode } from 'react';

import { type LegacyRenderAttachment } from './attachmentMiddleware';

type LegacyActivityProps = {
  children?: never | undefined;
  hideTimestamp: boolean;
  renderActivityStatus: (options: { hideTimestamp: boolean }) => ReactNode;
  renderAvatar: false | (() => Exclude<ReactNode, boolean | null | undefined>);
  showCallout: boolean;
};

type LegacyActivityComponent = (props: LegacyActivityProps) => Exclude<ReactNode, boolean | null | undefined>;

type LegacyActivityComponentFactoryOptions = {
  activity: WebChatActivity;
  nextVisibleActivity: WebChatActivity;
};

type LegacyActivityComponentFactory = (
  options: LegacyActivityComponentFactoryOptions
) => LegacyActivityComponent | false;

// TODO: [P2] This is inherited from our older signature (pre-hook) which requires passing "renderAttachment" argument.
//       With hooks, the middleware should not need "renderAttachment", they can grab it from "useCreateAttachmentRenderer" hook.
type LegacyRenderActivity = (
  renderAttachment: LegacyRenderAttachment,
  { hideTimestamp, renderActivityStatus, renderAvatar, showCallout }: LegacyActivityProps
) => Exclude<ReactNode, boolean>;

type LegacyActivityRenderer = (options: LegacyActivityComponentFactoryOptions) => LegacyRenderActivity | false;

// The middleware created by the web developer, are using the legacy signature (with "renderAttachment" argument).
type LegacyActivityEnhancer = (next: LegacyActivityRenderer) => LegacyActivityRenderer;
type LegacyActivityMiddleware = () => LegacyActivityEnhancer;

export type { LegacyActivityComponentFactory, LegacyActivityMiddleware, LegacyActivityProps, LegacyActivityRenderer };
