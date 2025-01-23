import { Components } from 'botframework-webchat-component';
import cx from 'classnames';
import React, { memo } from 'react';

const { MonochromeImageMasker } = Components;

const infoSmallIcon = `data:image/svg+xml;utf8,${encodeURIComponent('<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="M8.5 7.5a.5.5 0 1 0-1 0v3a.5.5 0 0 0 1 0v-3Zm.25-2a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM2 8a6 6 0 1 1 12 0A6 6 0 0 1 2 8Z"/></svg>')}`;

function InfoSmallIcon(props: Readonly<{ readonly className?: string }>) {
  return <MonochromeImageMasker className={cx('icon__info--small', props.className)} src={infoSmallIcon} />;
}

export default memo(InfoSmallIcon);
