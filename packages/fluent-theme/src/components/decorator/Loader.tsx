import React, { memo } from 'react';
import { useStyles } from '../../styles';
import styles from './Loader.module.css';

function Loader() {
  const classNames = useStyles(styles);
  return <div className={classNames.loader} />;
}

export default memo(Loader);
