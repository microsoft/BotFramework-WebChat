import { Components } from 'botframework-webchat-component';
import cx from 'classnames';
import React, { memo } from 'react';

const { MonochromeImageMasker } = Components;

const attachmentIcon = `data:image/svg+xml;utf8,${encodeURIComponent('<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="m4.83 10.48 5.65-5.65a3 3 0 0 1 4.25 4.24L8 15.8a1.5 1.5 0 0 1-2.12-2.12l6-6.01a.5.5 0 1 0-.7-.71l-6 6.01a2.5 2.5 0 0 0 3.53 3.54l6.71-6.72a4 4 0 1 0-5.65-5.66L4.12 9.78a.5.5 0 0 0 .7.7Z"/></svg>')}`;

function AttachmentIcon(props: Readonly<{ className?: string }>) {
  return <MonochromeImageMasker className={cx('icon__attachment', props.className)} src={attachmentIcon} />;
}

export default memo(AttachmentIcon);
