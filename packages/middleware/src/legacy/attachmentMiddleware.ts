// TODO: This is moved from /api, need to revisit/rewrite everything in this file.
import { type DirectLineAttachment, type WebChatActivity } from 'botframework-webchat-core';
import { type ReactNode } from 'react';

type LegacyAttachmentProps = {
  activity: WebChatActivity;
  attachment: DirectLineAttachment;
};

type LegacyRenderAttachment = (props?: LegacyAttachmentProps) => ReactNode;

type LegacyAttachmentEnhancer = (next: LegacyRenderAttachment) => LegacyRenderAttachment;
type LegacyAttachmentMiddleware = () => LegacyAttachmentEnhancer;

export { type LegacyAttachmentMiddleware, type LegacyRenderAttachment };
