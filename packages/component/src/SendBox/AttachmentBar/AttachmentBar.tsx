import { hooks } from 'botframework-webchat-api';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import cx from 'classnames';
import React, { memo, useCallback, useMemo } from 'react';
import { useRefFrom } from 'use-ref-from';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import styles from './AttachmentBar.module.css';
import testIds from '../../testIds';
import AttachmentBarItem from './AttachmentBarItem';

const { useSendBoxAttachments, useStyleOptions } = hooks;

const sendBoxAttachmentBarPropsSchema = pipe(
  object({
    className: optional(string())
  }),
  readonly()
);

type SendBoxAttachmentBarProps = InferInput<typeof sendBoxAttachmentBarPropsSchema>;

function SendBoxAttachmentBar(props: SendBoxAttachmentBarProps) {
  const { className } = validateProps(sendBoxAttachmentBarPropsSchema, props);

  const [sendBoxAttachments, setSendBoxAttachments] = useSendBoxAttachments();
  const classNames = useStyles(styles);
  const [{ sendBoxAttachmentBarMaxThumbnail }] = useStyleOptions();

  const mode = useMemo(
    () => (sendBoxAttachments.length > sendBoxAttachmentBarMaxThumbnail ? 'list item' : 'thumbnail'),
    [sendBoxAttachmentBarMaxThumbnail, sendBoxAttachments]
  );

  const sendBoxAttachmentsRef = useRefFrom(sendBoxAttachments);

  const handleAttachmentDelete = useCallback(
    ({ attachment }) =>
      setSendBoxAttachments(
        sendBoxAttachmentsRef.current.filter(sendBoxAttachment => sendBoxAttachment !== attachment)
      ),
    [setSendBoxAttachments, sendBoxAttachmentsRef]
  );

  return (
    sendBoxAttachments.length > 0 && (
      <div
        className={cx(
          classNames['send-box-attachment-bar'],
          {
            [classNames['send-box-attachment-bar--as-list-item']]: mode === 'list item',
            [classNames['send-box-attachment-bar--as-thumbnail']]: mode === 'thumbnail'
          },
          className
        )}
        data-testid={testIds.sendBoxAttachmentBar}
      >
        <div className={classNames['send-box-attachment-bar__box']}>
          {sendBoxAttachments.map((attachment, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <AttachmentBarItem attachment={attachment} key={index} mode={mode} onDelete={handleAttachmentDelete} />
          ))}
        </div>
      </div>
    )
  );
}

export default memo(SendBoxAttachmentBar);
export { sendBoxAttachmentBarPropsSchema, type SendBoxAttachmentBarProps };
