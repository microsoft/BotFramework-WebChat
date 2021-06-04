import { ReactNode } from 'react';

import DirectLineActivity from './external/DirectLineActivity';
import DirectLineAttachment from './external/DirectLineAttachment';

type RenderAttachment = ({
  activity,
  attachment
}: {
  activity: DirectLineActivity;
  attachment: DirectLineAttachment;
}) => ReactNode;

type AttachmentEnhancer = (next: RenderAttachment) => RenderAttachment;
type AttachmentMiddleware = () => AttachmentEnhancer;

export default AttachmentMiddleware;
