import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import styles from './StackedLayout.module.css';

const stackedLayoutRootPropsSchema = pipe(
  object({
    ariaLabelId: optional(string()),
    children: optional(reactNode()),
    extraTrailing: optional(boolean()),
    fromUser: optional(boolean()),
    hideAvatar: optional(boolean()),
    hideNub: optional(boolean()),
    isGroup: optional(boolean()),
    noMessage: optional(boolean()),
    showAvatar: optional(boolean()),
    showNub: optional(boolean()),
    topCallout: optional(boolean())
  }),
  readonly()
);

type StackedLayoutRootProps = InferInput<typeof stackedLayoutRootPropsSchema>;

const StackedLayoutRoot = memo((props: StackedLayoutRootProps) => {
  const {
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
  } = validateProps(stackedLayoutRootPropsSchema, props);

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
});

StackedLayoutRoot.displayName = 'StackedLayoutRoot';

export default StackedLayoutRoot;
export { stackedLayoutRootPropsSchema, type StackedLayoutRootProps };
