import { type SendBoxAttachment } from 'botframework-webchat-core';
import React, { memo } from 'react';

type BlobAttachmentPreviewProps = Readonly<{
  attachment: SendBoxAttachment & { blob: Blob };
  mode: 'text only' | 'thumbnail';
}>;

const BlobAttachmentPreview = ({ attachment }: BlobAttachmentPreviewProps) => {
  // TODO: Localize this.
  const name = attachment.blob instanceof File ? attachment.blob.name : 'An file';

  return (
    <div className="webchat__send-box-attachment-bar-item__preview webchat__send-box-attachment-bar-item__preview--is-blob">
      {name}
    </div>
  );
};

BlobAttachmentPreview.displayName = 'SendBoxAttachmentBarItemBlobAttachmentPreview';

export default memo(BlobAttachmentPreview);
export { type BlobAttachmentPreviewProps };
