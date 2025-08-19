import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo, type ReactNode } from 'react';

import styles from './StackedLayout.module.css';

type StackedLayoutStatusProps = Readonly<{
  children?: ReactNode | undefined;
}>;

const StackedLayoutStatus = memo(({ children }: StackedLayoutStatusProps) => {
  const classNames = useStyles(styles);

  return (
    <div className={cx(classNames['stacked-layout__status'])}>
      <div className={cx(classNames['stacked-layout__avatar-gutter'])} />
      <div className={cx(classNames['stacked-layout__nub-pad'])} />
      {children}
      <div className={cx(classNames['stacked-layout__alignment-pad'])} />
    </div>
  );
});

StackedLayoutStatus.displayName = 'StackedLayoutStatus';

export default StackedLayoutStatus;
