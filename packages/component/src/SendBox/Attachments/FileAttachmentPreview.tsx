import { type SendBoxAttachment } from 'botframework-webchat-core';
import React, { memo } from 'react';

type FileAttachmentPreviewProps = Readonly<{
  attachment: SendBoxAttachment & { blob: File };
}>;

const FileAttachmentPreview = ({ attachment }: FileAttachmentPreviewProps) => (
  <div className="webchat__send-box-attachment__preview webchat__send-box-attachment__preview--is-file">
    {attachment.blob.name}
  </div>
);

FileAttachmentPreview.displayName = 'FileAttachment';

export default memo(FileAttachmentPreview);
export { type FileAttachmentPreviewProps };
