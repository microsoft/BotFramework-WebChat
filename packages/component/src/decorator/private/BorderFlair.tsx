import React, { memo, type ReactNode } from 'react';

import { useStyles } from '../../Styles';
import styles from './BorderFlair.module.css';

function Flair({ children }: Readonly<{ children?: ReactNode | undefined }>) {
  const classNames = useStyles(styles);

  return <div className={classNames['border-flair']}>{children}</div>;
}

export default memo(Flair);
