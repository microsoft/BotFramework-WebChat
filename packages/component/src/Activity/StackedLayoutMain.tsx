import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo, type ReactNode } from 'react';

import styles from './StackedLayout.module.css';

type StackedLayoutMainProps = Readonly<{
  avatar?: ReactNode | undefined;
  children?: ReactNode | undefined;
}>;

const StackedLayoutMain = memo(({ avatar, children }: StackedLayoutMainProps) => {
  const classNames = useStyles(styles);

  return (
    <div className={classNames['stacked-layout__main']}>
      <div className={cx(classNames['stacked-layout__avatar-gutter'])}>{avatar}</div>
      <div className={cx(classNames['stacked-layout__content'])}>{children}</div>
      <div className={classNames['stacked-layout__alignment-pad']} />
    </div>
  );
});

StackedLayoutMain.displayName = 'StackedLayoutMain';

export default StackedLayoutMain;
