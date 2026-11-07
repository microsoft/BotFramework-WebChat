import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly } from 'valibot';

import styles from './Avatar.module.css';

const { useAvatarForBot, useAvatarForUser } = hooks;

const initialsAvatarPropsSchema = pipe(
  object({
    fromUser: optional(boolean())
  }),
  readonly()
);

type InitialsAvatarProps = InferReactProps<typeof initialsAvatarPropsSchema>;

function InitialsAvatar(props: InitialsAvatarProps) {
  const { fromUser = false } = validateProps(initialsAvatarPropsSchema, props);

  const [{ initials: avatarInitialsForBot }] = useAvatarForBot();
  const [{ initials: avatarInitialsForUser }] = useAvatarForUser();
  // Keeps the "webchat__initialsAvatar" class names.
  const classNames = useStyles(styles, webChatPrefixedClassName);

  return (
    <div className={cx(classNames['initialsAvatar'], { [classNames['initialsAvatar--fromUser']]: fromUser })}>
      <div className={classNames['initialsAvatar__initials']}>
        {fromUser ? avatarInitialsForUser : avatarInitialsForBot}
      </div>
    </div>
  );
}

export default memo(InitialsAvatar);
export { initialsAvatarPropsSchema, type InitialsAvatarProps };
