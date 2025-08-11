import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo } from 'react';
import { object, picklist, pipe, readonly, string, type InferInput } from 'valibot';

import { ComponentIcon } from '../../../Icon';
import { sendBoxAttachmentSchema } from './sendBoxAttachment';
import styles from './FilePreview.module.css'; // Added import for css modules

const sendBoxAttachmentBarItemFileAttachmentPreviewPropsSchema = pipe(
  object({
    attachment: sendBoxAttachmentSchema,
    attachmentName: string(),
    mode: picklist(['list item', 'thumbnail'])
  }),
  readonly()
);

type SendBoxAttachmentBarItemFileAttachmentPreviewProps = InferInput<
  typeof sendBoxAttachmentBarItemFileAttachmentPreviewPropsSchema
>;

function SendBoxAttachmentBarItemFileAttachmentPreview(props: SendBoxAttachmentBarItemFileAttachmentPreviewProps) {
  const { attachment, mode, attachmentName } = validateProps(
    sendBoxAttachmentBarItemFileAttachmentPreviewPropsSchema,
    props
  );

  const classNames = useStyles(styles);

  return mode === 'list item' ? (
    <div
      className={cx(
        classNames['send-box-attachment-bar-item-file-preview'],
        classNames['send-box-attachment-bar-item-file-preview--as-list-item'],
        {
          [classNames['send-box-attachment-bar-item-file-preview--is-file']]: !attachment.thumbnailURL,
          [classNames['send-box-attachment-bar-item-file-preview--is-image']]: attachment.thumbnailURL
        }
      )}
    >
      <ComponentIcon />
      <div className={classNames['send-box-attachment-bar-item-file-preview__text']}>{attachmentName}</div>
    </div>
  ) : (
    <div
      className={cx(
        classNames['send-box-attachment-bar-item-file-preview'],
        classNames['send-box-attachment-bar-item-file-preview--as-thumbnail'],
        classNames['send-box-attachment-bar-item-file-preview--is-file']
      )}
    >
      <ComponentIcon />
    </div>
  );
}

export default memo(SendBoxAttachmentBarItemFileAttachmentPreview);
export {
  sendBoxAttachmentBarItemFileAttachmentPreviewPropsSchema,
  type SendBoxAttachmentBarItemFileAttachmentPreviewProps
};
