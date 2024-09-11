import React, { Fragment, memo, useCallback, useState, type ReactNode } from 'react';
import cx from 'classnames';

import { useStyles } from '../../../styles';
import styles from './BorderFlair.module.css';

function BorderFlair({ children }: Readonly<{ children?: ReactNode | undefined }>) {
  const classNames = useStyles(styles);
  const [isComplete, setComplete] = useState(false);

  const handleAnimationEnd = useCallback(
    event =>
      (event.animationName === styles['borderAnimation-angle'] ||
        event.animationName === styles['borderFlair-animation']) &&
      setComplete(true),
    []
  );

  return (
    <Fragment>
      {children}
      <div
        className={cx(classNames['border-flair'], isComplete && classNames['border-flair--complete'])}
        onAnimationEnd={handleAnimationEnd}
      />
    </Fragment>
  );
}

export default memo(BorderFlair);
