import React, { type ReactNode } from 'react';
import styles from './Theme.module.css';
import { useStyles } from '../styles';

export default function WebchatTheme(props: Readonly<{ readonly children: ReactNode | undefined }>) {
  const classNames = useStyles(styles);
  return <div className={classNames['webchat-fluent__theme']}>{props.children}</div>;
}
