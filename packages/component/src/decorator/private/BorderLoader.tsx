import React, { Fragment, memo, type ReactNode } from 'react';

import { useStyles } from 'botframework-webchat-styles/react';
import styles from './BorderLoader.module.css';

function Loader({ children }: Readonly<{ children?: ReactNode | undefined }>) {
  const classNames = useStyles(styles);

  return (
    <div className={classNames['border-loader']}>
      {children}
      <div className={classNames['border-loader__loader']} />
    </div>
  );
}

export default memo(Loader);
