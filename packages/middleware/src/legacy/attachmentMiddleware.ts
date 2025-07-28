// TODO: This is moved from /api, need to revisit/rewrite everything in this file.
import { type ReactNode } from 'react';
import type { DirectLineAttachment, WebChatActivity } from 'botframework-webchat-core';

type AttachmentProps = {
  activity: WebChatActivity;
  attachment: DirectLineAttachment;
};

type RenderAttachment = (props?: AttachmentProps) => ReactNode;

type AttachmentEnhancer = (next: RenderAttachment) => RenderAttachment;
type AttachmentMiddleware = () => AttachmentEnhancer;

export default AttachmentMiddleware;

export type { RenderAttachment };
