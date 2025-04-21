import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo, useCallback, useMemo } from 'react';
import { useRefFrom } from 'use-ref-from';

import { useStyleSet } from '../../hooks';
import testIds from '../../testIds';
import AttachmentBarItem from './AttachmentBarItem';

const { useSendBoxAttachments, useStyleOptions } = hooks;

const Attachments = () => {
  const [sendBoxAttachments, setSendBoxAttachments] = useSendBoxAttachments();
  const [{ sendBoxAttachmentBar: sendBoxAttachmentBarClassName }] = useStyleSet();
  const [{ sendBoxAttachmentBarMaxThumbnail }] = useStyleOptions();

  const mode = useMemo(
    () => (sendBoxAttachments.length > sendBoxAttachmentBarMaxThumbnail ? 'text only' : 'thumbnail'),
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
    )
  );
};

Attachments.displayName = 'SendBoxAttachmentBar';

export default memo(Attachments);
