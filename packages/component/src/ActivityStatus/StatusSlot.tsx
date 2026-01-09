import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo, ReactNode } from 'react';
import cx from 'classnames';

import styles from './ActivityStatus.module.css';

type Props = Readonly<{ className?: string; children?: ReactNode | undefined }>;

const StatusSlot = ({ children, className }: Props) => {
  const classNames = useStyles(styles);

  return <span className={cx(classNames['activity-status-slot'], className)}>{children}</span>;
};

StatusSlot.displayName = 'StatusSlot';

export default memo(StatusSlot);
