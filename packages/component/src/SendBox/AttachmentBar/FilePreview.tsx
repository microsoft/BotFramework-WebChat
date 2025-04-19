import { type SendBoxAttachment } from 'botframework-webchat-core';
import React, { memo } from 'react';

type FileAttachmentPreviewProps = Readonly<{
  attachment: SendBoxAttachment & { blob: File };
  mode: 'text only' | 'thumbnail';
}>;

const FileAttachmentPreview = ({ attachment }: FileAttachmentPreviewProps) => (
  <div className="webchat__send-box-attachment-bar-item__preview webchat__send-box-attachment-bar-item__preview--is-file">
    {attachment.blob.name}
  </div>
);

FileAttachmentPreview.displayName = 'SendBoxAttachmentBarItemFileAttachmentPreview';

export default memo(FileAttachmentPreview);
export { type FileAttachmentPreviewProps };
