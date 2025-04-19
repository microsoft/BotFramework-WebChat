import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo, useCallback } from 'react';
import { useRefFrom } from 'use-ref-from';

import { useStyleSet } from '../../hooks';
import Attachment from './Attachment';

const { useSendBoxAttachments } = hooks;

const Attachments = () => {
  const [sendBoxAttachments, setSendBoxAttachments] = useSendBoxAttachments();
  const sendBoxAttachmentsRef = useRefFrom(sendBoxAttachments);
  const [{ sendBoxAttachmentBar: sendBoxAttachmentBarClassName }] = useStyleSet();
  const handleAttachmentDelete = useCallback(
    ({ attachment }) =>
      setSendBoxAttachments(
        sendBoxAttachmentsRef.current.filter(sendBoxAttachment => sendBoxAttachment !== attachment)
      ),
    [setSendBoxAttachments, sendBoxAttachmentsRef]
  );

  return (
    <div className={classNames(sendBoxAttachmentBarClassName, 'webchat__send-box-attachment-bar')}>
      <div className="webchat__send-box-attachment-bar__box">
        {sendBoxAttachments.map((attachment, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Attachment attachment={attachment} key={index} onDelete={handleAttachmentDelete} />
        ))}
      </div>
    </div>
  );
};

Attachments.displayName = 'Attachments';

export default memo(Attachments);
