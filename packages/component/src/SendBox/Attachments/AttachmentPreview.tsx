import { type SendBoxAttachment } from 'botframework-webchat-core';
import React, { memo } from 'react';
import BlobAttachmentPreview from './BlobAttachmentPreview';
import FileAttachmentPreview from './FileAttachmentPreview';
import ImageAttachmentPreview from './ImageAttachmentPreview';

type AttachmentPreviewProps = Readonly<{
  attachment: SendBoxAttachment;
}>;

// TODO: Turn this into middleware.
const AttachmentPreview = ({ attachment }: AttachmentPreviewProps) => {
  if (attachment.thumbnailURL) {
    return <ImageAttachmentPreview attachment={attachment as SendBoxAttachment & { thumbnailURL: URL }} />;
  }

  if (attachment.blob instanceof File) {
    return <FileAttachmentPreview attachment={attachment as SendBoxAttachment & { blob: File }} />;
  }

  return <BlobAttachmentPreview attachment={attachment} />;
};

AttachmentPreview.displayName = 'AttachmentPreview';

export default memo(AttachmentPreview);
export { type AttachmentPreviewProps };
