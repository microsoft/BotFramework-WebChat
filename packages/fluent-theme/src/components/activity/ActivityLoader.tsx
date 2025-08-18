import { useStyles } from 'botframework-webchat-styles/react';
import cx from 'classnames';
import React, { Fragment, memo, type ReactNode } from 'react';

import { useVariantClassName } from '../../styles';
import SlidingDots from '../assets/SlidingDots';
import styles from './ActivityLoader.module.css';

function FluentActivityLoader({
  children,
  className,
  showLoader = true
}: Readonly<{ children?: ReactNode | undefined; className?: string | undefined; showLoader?: boolean }>) {
  const classNames = useStyles(styles);
  const variantClassName = useVariantClassName(classNames);

  return (
    <Fragment>
      {children}
      {showLoader && <SlidingDots className={cx(classNames['activity-loader'], variantClassName, className)} />}
    </Fragment>
  );
}

export default memo(FluentActivityLoader);
