import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo } from 'react';

import styles from './MessageStatusLoader.module.css';
import { ComponentIcon } from '../../Icon';

function MessageStatusLoader({ className }: Readonly<{ className?: string | undefined }>) {
  const classNames = useStyles(styles);
  return <ComponentIcon appearance="text" className={cx(classNames['message-status-loader'], className)} />;
}

export default memo(MessageStatusLoader);
