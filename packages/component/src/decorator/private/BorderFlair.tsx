import React, { Fragment, memo, useCallback, useState, type ReactNode } from 'react';
import cx from 'classnames';
import { useStyles } from 'botframework-webchat-styles/react';

import styles from './BorderFlair.module.css';

function BorderFlair({
  children,
  showFlair = true
}: Readonly<{ children?: ReactNode | undefined; showFlair?: boolean }>) {
  const classNames = useStyles(styles);
  const [isComplete, setComplete] = useState(false);

  const handleAnimationEnd = useCallback(
    event =>
      (event.animationName === styles['borderAnimation-angle'] ||
        event.animationName === styles['borderFlair-animation']) &&
      setComplete(true),
    []
  );

  if (!showFlair && isComplete) {
    setComplete(false);
  }

  return (
    <Fragment>
      {children}
      {showFlair && (
        <div
          className={cx(classNames['border-flair'], isComplete && classNames['border-flair--complete'])}
          onAnimationEnd={handleAnimationEnd}
        />
      )}
    </Fragment>
  );
}

export default memo(BorderFlair);
