import React, { memo, type ReactNode } from 'react';
import { useStyles } from '../../styles';
import styles from './Loader.module.css';

function Loader({ children }: Readonly<{ children?: ReactNode }>) {
  const classNames = useStyles(styles);
  return (
    <React.Fragment>
      {children}
      <div className={classNames['loader']} />
    </React.Fragment>
  );
}

export default memo(Loader);
