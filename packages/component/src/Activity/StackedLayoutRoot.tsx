import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo, type ReactNode } from 'react';

import styles from './StackedLayout.module.css';

type StackedLayoutRootProps = Readonly<{
  ariaLabelId?: string | undefined;
  children?: ReactNode | undefined;
  extraTrailing?: boolean | undefined;
  fromUser?: boolean | undefined;
  hideAvatar?: boolean | undefined;
  hideNub?: boolean | undefined;
  isGroup?: boolean | undefined;
  noMessage?: boolean | undefined;
  showAvatar?: boolean | undefined;
  showNub?: boolean | undefined;
  topCallout?: boolean | undefined;
}>;

const StackedLayoutRoot = memo(
  ({
    ariaLabelId,
    children,
    extraTrailing,
    fromUser,
    hideAvatar,
    hideNub,
    isGroup,
    noMessage,
    showAvatar,
    showNub,
    topCallout
  }: StackedLayoutRootProps) => {
    const classNames = useStyles(styles);

    return (
      <div
        aria-labelledby={ariaLabelId}
        className={cx('webchat__stacked-layout', classNames['stacked-layout'], {
          [classNames['stacked-layout--from-user']]: fromUser,
          [classNames['stacked-layout--extra-trailing']]: extraTrailing,
          [classNames['stacked-layout--hide-avatar']]: hideAvatar,
          [classNames['stacked-layout--hide-nub']]: hideNub,
          [classNames['stacked-layout--group']]: isGroup,
          [classNames['stacked-layout--no-message']]: noMessage,
          [classNames['stacked-layout--show-avatar']]: showAvatar,
          [classNames['stacked-layout--show-nub']]: showNub,
          [classNames['stacked-layout--top-callout']]: topCallout
        })}
      >
        {children}
      </div>
    );
  }
);

StackedLayoutRoot.displayName = 'StackedLayoutRoot';

export default StackedLayoutRoot;
