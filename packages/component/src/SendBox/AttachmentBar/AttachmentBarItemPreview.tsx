import { type SendBoxAttachment } from 'botframework-webchat-core';
import React, { memo } from 'react';

import BlobPreview from './BlobPreview';
import FilePreview from './FilePreview';
import ImagePreview from './ImagePreview';

type AttachmentBarItemPreviewProps = Readonly<{
  attachment: SendBoxAttachment;
  mode: 'text only' | 'thumbnail';
}>;

// TODO: Turn this into middleware.
const AttachmentBarItemPreview = ({ attachment, mode }: AttachmentBarItemPreviewProps) => {
  if (attachment.thumbnailURL) {
    return <ImagePreview attachment={attachment as SendBoxAttachment & { thumbnailURL: URL }} mode={mode} />;
  }

  if (attachment.blob instanceof File) {
    return <FilePreview attachment={attachment as SendBoxAttachment & { blob: File }} mode={mode} />;
  }

  return <BlobPreview attachment={attachment} mode={mode} />;
};

AttachmentBarItemPreview.displayName = 'SendBoxAttachmentBarItemPreview';

export default memo(AttachmentBarItemPreview);
export { type AttachmentBarItemPreviewProps };
