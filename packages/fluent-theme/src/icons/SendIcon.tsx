import { Components } from 'botframework-webchat-component';
import cx from 'classnames';
import React, { memo } from 'react';

const { MonochromeImageMasker } = Components;

const sendIcon = `data:image/svg+xml;utf8,${encodeURIComponent('<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M2.18 2.11a.5.5 0 0 1 .54-.06l15 7.5a.5.5 0 0 1 0 .9l-15 7.5a.5.5 0 0 1-.7-.58L3.98 10 2.02 2.63a.5.5 0 0 1 .16-.52Zm2.7 8.39-1.61 6.06L16.38 10 3.27 3.44 4.88 9.5h6.62a.5.5 0 1 1 0 1H4.88Z"/></svg>')}`;

function SendIcon(props: Readonly<{ readonly className?: string }>) {
  return <MonochromeImageMasker className={cx('icon__send', props.className)} src={sendIcon} />;
}

export default memo(SendIcon);
