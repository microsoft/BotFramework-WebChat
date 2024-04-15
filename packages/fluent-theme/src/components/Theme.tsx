import React, { type ReactNode } from 'react';
import cx from 'classnames';
import styles from './Theme.module.css';
import { useStyles } from '../styles';

export const rootClassName = 'webchat-fluent';

export default function WebchatTheme(props: Readonly<{ readonly children: ReactNode | undefined }>) {
  const classNames = useStyles(styles);
  return <div className={cx(rootClassName, classNames.theme)}>{props.children}</div>;
}
