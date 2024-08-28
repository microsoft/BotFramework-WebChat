import React, { Fragment, memo, type ReactNode } from 'react';

import { useStyles } from '../../../styles';
import styles from './BorderFlair.module.css';

function BorderFlair({ children }: Readonly<{ children?: ReactNode | undefined }>) {
  const classNames = useStyles(styles);

  return (
    <Fragment>
      {children}
      <div className={classNames['border-flair']} />
    </Fragment>
  );
}

export default memo(BorderFlair);
