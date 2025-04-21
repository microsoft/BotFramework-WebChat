import { type SendBoxAttachment } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo } from 'react';
import { useStyleSet } from '../../../hooks';
import FilePreview from './FilePreview';

type ImageAttachmentPreviewProps = Readonly<{
  attachment: SendBoxAttachment & {
    thumbnailURL: URL;
  };
  attachmentName: string;
  mode: 'text only' | 'thumbnail';
}>;

const ImageAttachmentPreview = ({ attachment, mode, attachmentName }: ImageAttachmentPreviewProps) => {
  const [{ sendBoxAttachmentBarItemImagePreview: sendBoxAttachmentBarItemImagePreviewClassName }] = useStyleSet();

  return mode === 'text only' ? (
    <FilePreview attachment={attachment} attachmentName={attachmentName} mode={mode} />
  ) : (
    <img
      alt={attachmentName}
      className={classNames(
        sendBoxAttachmentBarItemImagePreviewClassName,
        'webchat__send-box-attachment-bar-item-image-preview'
      )}
      src={attachment.thumbnailURL.href}
    />
  );
};

ImageAttachmentPreview.displayName = 'SendBoxAttachmentBarItemImageAttachmentPreview';

export default memo(ImageAttachmentPreview);
export { type ImageAttachmentPreviewProps };
