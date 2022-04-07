import { ReactNode } from 'react';
import type { WebChatActivity } from 'botframework-webchat-core';

import { AvatarComponentFactory } from './AvatarMiddleware';
import { RenderAttachment } from './AttachmentMiddleware';

type ActivityProps = {
  hideTimestamp: boolean;
  renderActivityStatus: ({ hideTimestamp: boolean }) => ReactNode;
  renderAvatar: AvatarComponentFactory;
  showCallout: boolean;
};

type ActivityComponent = (props: ActivityProps) => Exclude<ReactNode, boolean>;

type ActivityComponentFactoryOptions = {
  activity: WebChatActivity;
  nextVisibleActivity: WebChatActivity;
};

type ActivityComponentFactory = (options: ActivityComponentFactoryOptions) => ActivityComponent | false;

// TODO: [P2] This is inherited from our older signature (pre-hook) which requires passing "renderAttachment" argument.
//       With hooks, the middleware should not need "renderAttachment", they can grab it from "useCreateAttachmentRenderer" hook.
type LegacyRenderActivity = (
  renderAttachment: RenderAttachment,
  { hideTimestamp, renderActivityStatus, renderAvatar, showCallout }: ActivityProps
) => Exclude<ReactNode, boolean>;

type LegacyActivityRenderer = (options: ActivityComponentFactoryOptions) => LegacyRenderActivity | false;

// The middleware created by the web developer, are using the legacy signature (with "renderAttachment" argument).
type ActivityEnhancer = (next: LegacyActivityRenderer) => LegacyActivityRenderer;
type ActivityMiddleware = () => ActivityEnhancer;

export default ActivityMiddleware;

export type { ActivityComponentFactory, LegacyActivityRenderer };
