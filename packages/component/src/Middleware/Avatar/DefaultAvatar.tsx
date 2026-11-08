import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo } from 'react';
import { boolean, never, object, optional, pipe, readonly, string } from 'valibot';

import styles from '../../Avatar/Avatar.module.css';
import ImageAvatar from '../../Avatar/ImageAvatar';
import InitialsAvatar from '../../Avatar/InitialsAvatar';

const defaultAvatarPropsSchema = pipe(
  object({
    'aria-hidden': optional(boolean()),
    children: optional(never()),
    className: optional(string()),
    fromUser: boolean()
  }),
  readonly()
);

type DefaultAvatarProps = InferReactProps<typeof defaultAvatarPropsSchema>;

function DefaultAvatar(props: DefaultAvatarProps) {
  const {
    'aria-hidden': ariaHidden = true,
    className,
    fromUser
  } = validateProps(defaultAvatarPropsSchema, props, 'strict');

  // Keeps the "webchat__defaultAvatar" class names.
  const classNames = useStyles(styles, webChatPrefixedClassName);

  return (
    <div
      aria-hidden={ariaHidden}
      className={cx(classNames['defaultAvatar'], { [classNames['defaultAvatar--fromUser']]: fromUser }, className)}
    >
      <InitialsAvatar fromUser={fromUser} />
      <ImageAvatar fromUser={fromUser} />
    </div>
  );
}

DefaultAvatar.displayName = 'DefaultAvatar';

export default memo(DefaultAvatar);

export { defaultAvatarPropsSchema, type DefaultAvatarProps };
