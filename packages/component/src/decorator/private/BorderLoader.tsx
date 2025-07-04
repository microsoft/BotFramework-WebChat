import React, { memo, type ReactNode } from 'react';
import { useStyles } from 'botframework-webchat-styles/react';

import styles from './BorderLoader.module.css';

function BorderLoader({
  children,
  showLoader = true
}: Readonly<{ children?: ReactNode | undefined; showLoader?: boolean }>) {
  const classNames = useStyles(styles);

  return (
    <div className={classNames['border-loader']}>
      {children}
      {showLoader && (
        <div className={classNames['border-loader__track']}>
          <div className={classNames['border-loader__loader']} />
        </div>
      )}
    </div>
  );
}

export default memo(BorderLoader);
