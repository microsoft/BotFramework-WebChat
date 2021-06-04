import { ReactNode } from 'react';

import DirectLineActivity from './external/DirectLineActivity';
import DirectLineAttachment from './external/DirectLineAttachment';

type RenderAttachment = () => ReactNode;

type AttachmentRenderer = ({
  activity,
  attachment
}: {
  activity: DirectLineActivity;
  attachment: DirectLineAttachment;
}) => RenderAttachment | false;

type AttachmentEnhancer = (next: AttachmentRenderer) => AttachmentRenderer;
type AttachmentMiddleware = () => AttachmentEnhancer;

export default AttachmentMiddleware;
