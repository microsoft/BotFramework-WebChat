import React, { type ReactNode } from 'react';
import cx from 'classnames';
import styles from './Theme.module.css';
import { useStyles, useVariantClassName } from '../../styles';

export const rootClassName = 'webchat-fluent';

export default function Theme(props: Readonly<{ readonly children: ReactNode | undefined }>) {
  const classNames = useStyles(styles);
  const variantClassName = useVariantClassName(styles);
  return <div className={cx(rootClassName, classNames['theme'], variantClassName)}>{props.children}</div>;
}
