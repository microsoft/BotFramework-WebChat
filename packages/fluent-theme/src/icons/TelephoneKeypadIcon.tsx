import { Components } from 'botframework-webchat-component';
import cx from 'classnames';
import React, { memo } from 'react';

const { MonochromeImageMasker } = Components;

const telephoneKeypadIcon = `data:image/svg+xml;utf8,${encodeURIComponent('<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M6 5.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Zm0 4a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM7.25 12a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0ZM10 5.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM11.25 8a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0ZM10 13.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM11.25 16a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0ZM14 5.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5ZM15.25 8a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0ZM14 13.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z"/></svg>')}`;

function TelephoneKeypadIcon(props: Readonly<{ readonly className?: string }>) {
  return <MonochromeImageMasker className={cx('icon__telephone-keypad', props.className)} src={telephoneKeypadIcon} />;
}

export default memo(TelephoneKeypadIcon);
