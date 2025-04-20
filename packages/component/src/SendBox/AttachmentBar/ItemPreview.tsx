import { type SendBoxAttachment } from 'botframework-webchat-core';
import React, { memo } from 'react';

import FilePreview from './Preview/FilePreview';
import ImagePreview from './Preview/ImagePreview';

type AttachmentBarItemPreviewProps = Readonly<{
  attachment: SendBoxAttachment;
  mode: 'text only' | 'thumbnail';
}>;

// TODO: Turn this into middleware.
const AttachmentBarItemPreview = ({ attachment, mode }: AttachmentBarItemPreviewProps) => {
  let element: React.ReactNode;

  if (attachment.thumbnailURL) {
    element = <ImagePreview attachment={attachment as SendBoxAttachment & { thumbnailURL: URL }} mode={mode} />;
  } else {
    element = <FilePreview attachment={attachment as SendBoxAttachment & { blob: File }} mode={mode} />;
  }

  return <div className="webchat__send-box-attachment-bar-item__preview">{element}</div>;
};

AttachmentBarItemPreview.displayName = 'SendBoxAttachmentBarItemPreview';

export default memo(AttachmentBarItemPreview);
export { type AttachmentBarItemPreviewProps };
