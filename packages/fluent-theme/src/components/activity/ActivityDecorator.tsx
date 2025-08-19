import { WebChatActivity } from 'botframework-webchat-component';
import cx from 'classnames';
import React, { ReactNode, memo } from 'react';
import { useStyles, useVariantClassName } from '../../styles';
import styles from './ActivityDecorator.module.css';

function ActivityDecorator({ children }: Readonly<{ activity: WebChatActivity; children: ReactNode }>) {
  const classNames = useStyles(styles);
  const variantClassName = useVariantClassName(styles);

  return <div className={cx(classNames['activity-decorator'], variantClassName)}>{children}</div>;
}

ActivityDecorator.displayName = 'ActivityDecorator';

export default memo(ActivityDecorator);
