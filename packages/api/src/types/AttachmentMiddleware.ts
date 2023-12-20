import { type ReactNode } from 'react';
import { type DirectLineAttachment, type WebChatActivity } from 'botframework-webchat-core';

type AttachmentProps = {
  activity: WebChatActivity;
  attachment: DirectLineAttachment;
};

type RenderAttachment = (props?: AttachmentProps) => ReactNode;

type AttachmentEnhancer = (next: RenderAttachment) => RenderAttachment;
type AttachmentMiddleware = () => AttachmentEnhancer;

export default AttachmentMiddleware;

export type { RenderAttachment };
