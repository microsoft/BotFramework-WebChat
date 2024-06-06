import React, { memo, type ReactNode } from 'react';
import { useStyles } from '../../styles';
import styles from './Flair.module.css';

function Flair({ children }: Readonly<{ children?: ReactNode | undefined }>) {
  const classNames = useStyles(styles);
  return <div className={classNames['flair']}>{children}</div>;
}

export default memo(Flair);
