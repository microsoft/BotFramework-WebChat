import React, { memo, type ReactNode } from 'react';

import { useStyles } from '../../Styles';
import styles from './BorderLoader.module.css';

function Loader({ children }: Readonly<{ children?: ReactNode | undefined }>) {
  const classNames = useStyles(styles);

  return (
    <React.Fragment>
      {children}
      <div className={classNames['border-loader']} />
    </React.Fragment>
  );
}

export default memo(Loader);
