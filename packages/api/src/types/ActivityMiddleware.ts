import type { ReactNode } from 'react';
import type { RenderAttachment } from './AttachmentMiddleware';
import type { WebChatActivity } from 'botframework-webchat-core';

type ActivityProps = {
  hideTimestamp: boolean;
  renderActivityStatus: (options: { hideTimestamp: boolean }) => ReactNode;
  renderAvatar: false | (() => Exclude<ReactNode, boolean | null | undefined>);
  showCallout: boolean;
};

type ActivityComponent = (props: ActivityProps) => Exclude<ReactNode, boolean | null | undefined>;

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
