import { hooks } from 'botframework-webchat-api';
import { type SendBoxAttachment } from 'botframework-webchat-core';
import classNames from 'classnames';
import React, { memo } from 'react';
import { useStyleSet } from '../../../hooks';
import FileIcon from './FileIcon';
import ImageIcon from './ImageIcon';

const { useLocalizer } = hooks;

type FileAttachmentPreviewProps = Readonly<{
  attachment: SendBoxAttachment;
  mode: 'text only' | 'thumbnail';
}>;

const FileAttachmentPreview = ({ attachment, mode }: FileAttachmentPreviewProps) => {
  const [{ sendBoxAttachmentBarItemFilePreview: sendBoxAttachmentBarItemFilePreviewClassName }] = useStyleSet();
  const localize = useLocalizer();
  const title =
    attachment.blob instanceof File ? attachment.blob.name : localize('SEND_BOX_ATTACHMENT_BAR_GENERIC_FILE_ALT');

  return mode === 'text only' ? (
    <div
      className={classNames(
        sendBoxAttachmentBarItemFilePreviewClassName,
        'webchat__send-box-attachment-bar-item-file-preview',
        'webchat__send-box-attachment-bar-item-file-preview--text-only'
      )}
      title={title}
    >
      {attachment.thumbnailURL ? <ImageIcon /> : <FileIcon />}
      <div className="webchat__send-box-attachment-bar-item-file-preview__text">{title}</div>
    </div>
  ) : (
    <div
      className={classNames(
        sendBoxAttachmentBarItemFilePreviewClassName,
        'webchat__send-box-attachment-bar-item-file-preview',
        'webchat__send-box-attachment-bar-item-file-preview--thumbnail'
      )}
      title={title}
    >
      <FileIcon size="large" />
    </div>
  );
};

FileAttachmentPreview.displayName = 'SendBoxAttachmentBarItemFileAttachmentPreview';

export default memo(FileAttachmentPreview);
export { type FileAttachmentPreviewProps };
