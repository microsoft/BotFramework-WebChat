import { DirectLineActivity, DirectLineAttachment } from 'botframework-webchat-core';
import { ReactNode } from 'react';

type AttachmentProps = {
  activity: DirectLineActivity;
  attachment: DirectLineAttachment;
};

type RenderAttachment = (props?: AttachmentProps) => ReactNode;

type AttachmentEnhancer = (next: RenderAttachment) => RenderAttachment;
type AttachmentMiddleware = () => AttachmentEnhancer;

export default AttachmentMiddleware;

export type { RenderAttachment };
