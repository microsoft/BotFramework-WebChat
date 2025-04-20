import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo, useCallback } from 'react';
import { useRefFrom } from 'use-ref-from';

import { useStyleSet } from '../../hooks';
import testIds from '../../testIds';
import AttachmentBarItem from './AttachmentBarItem';

const { useSendBoxAttachments } = hooks;

const MAX_THUMBNAIL_BEFORE_TEXT_ONLY = 3;

const Attachments = () => {
  const [sendBoxAttachments, setSendBoxAttachments] = useSendBoxAttachments();
  const [{ sendBoxAttachmentBar: sendBoxAttachmentBarClassName }] = useStyleSet();

  const mode = sendBoxAttachments.length > MAX_THUMBNAIL_BEFORE_TEXT_ONLY ? 'text only' : 'thumbnail';
  const sendBoxAttachmentsRef = useRefFrom(sendBoxAttachments);

  const handleAttachmentDelete = useCallback(
    ({ attachment }) =>
      setSendBoxAttachments(
        sendBoxAttachmentsRef.current.filter(sendBoxAttachment => sendBoxAttachment !== attachment)
      ),
    [setSendBoxAttachments, sendBoxAttachmentsRef]
  );

  return (
    <div
      className={classNames(sendBoxAttachmentBarClassName, 'webchat__send-box-attachment-bar', {
        'webchat__send-box-attachment-bar--text-only': mode === 'text only',
        'webchat__send-box-attachment-bar--thumbnail': mode === 'thumbnail'
      })}
      data-testid={testIds.sendBoxAttachmentBar}
    >
      <div className="webchat__send-box-attachment-bar__box">
        {sendBoxAttachments.map((attachment, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <AttachmentBarItem attachment={attachment} key={index} mode={mode} onDelete={handleAttachmentDelete} />
        ))}
      </div>
    </div>
  );
};

Attachments.displayName = 'SendBoxAttachmentBar';

export default memo(Attachments);
