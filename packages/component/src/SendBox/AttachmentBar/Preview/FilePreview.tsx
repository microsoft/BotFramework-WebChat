import { type SendBoxAttachment } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo } from 'react';
import { useStyleSet } from '../../../hooks';
import FileIcon from './FileIcon';
import ImageIcon from './ImageIcon';

type FileAttachmentPreviewProps = Readonly<{
  attachment: SendBoxAttachment;
  attachmentName: string;
  mode: 'text only' | 'thumbnail';
}>;

const FileAttachmentPreview = ({ attachment, mode, attachmentName }: FileAttachmentPreviewProps) => {
  const [{ sendBoxAttachmentBarItemFilePreview: sendBoxAttachmentBarItemFilePreviewClassName }] = useStyleSet();

  return mode === 'text only' ? (
    <div
      className={classNames(
        sendBoxAttachmentBarItemFilePreviewClassName,
        'webchat__send-box-attachment-bar-item-file-preview',
        'webchat__send-box-attachment-bar-item-file-preview--text-only'
      )}
    >
      {attachment.thumbnailURL ? <ImageIcon /> : <FileIcon />}
      <div className="webchat__send-box-attachment-bar-item-file-preview__text">{attachmentName}</div>
    </div>
  ) : (
    <div
      className={classNames(
        sendBoxAttachmentBarItemFilePreviewClassName,
        'webchat__send-box-attachment-bar-item-file-preview',
        'webchat__send-box-attachment-bar-item-file-preview--thumbnail'
      )}
    >
      <FileIcon size="large" />
    </div>
  );
};

FileAttachmentPreview.displayName = 'SendBoxAttachmentBarItemFileAttachmentPreview';

export default memo(FileAttachmentPreview);
export { type FileAttachmentPreviewProps };
