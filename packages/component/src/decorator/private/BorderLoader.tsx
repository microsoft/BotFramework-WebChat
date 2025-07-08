import React, { Fragment, memo, type ReactNode } from 'react';
import { useStyles } from 'botframework-webchat-styles/react';

import styles from './BorderLoader.module.css';

function BorderLoader({
  children,
  showLoader = true
}: Readonly<{ children?: ReactNode | undefined; showLoader?: boolean }>) {
  const classNames = useStyles(styles);

  return (
    <Fragment>
      {children}
      {showLoader && (
        <div className={classNames['border-loader__track']}>
          <div className={classNames['border-loader__loader']} />
        </div>
      )}
    </Fragment>
  );
}

export default memo(BorderLoader);
