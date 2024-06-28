import cx from 'classnames';
import React, { type ReactNode } from 'react';
import { useStyles } from '../../styles';
import styles from './Theme.module.css';

export const rootClassName = 'webchat-fluent';

export default function WebchatTheme(props: Readonly<{ readonly children: ReactNode | undefined }>) {
  const classNames = useStyles(styles);
  return <div className={cx(rootClassName, classNames['theme'])}>{props.children}</div>;
}
