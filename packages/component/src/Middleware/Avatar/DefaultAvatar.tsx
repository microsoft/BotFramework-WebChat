import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import classNames from 'classnames';
import React, { memo } from 'react';
import { boolean, never, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import ImageAvatar from '../../Avatar/ImageAvatar';
import InitialsAvatar from '../../Avatar/InitialsAvatar';
import { useStyleToEmotionObject } from '../../hooks/internal/styleToEmotionObject';
import useStyleSet from '../../hooks/useStyleSet';

const ROOT_STYLE = {
  overflow: ['hidden', 'clip'],
  position: 'relative',

  '> *': {
    left: 0,
    position: 'absolute',
    top: 0
  }
};

const defaultAvatarPropsSchema = pipe(
  object({
    'aria-hidden': optional(boolean(), true),
    children: optional(never()),
    className: optional(string()),
    fromUser: boolean()
  }),
  readonly()
);

// eslint-disable-next-line react/require-default-props
type DefaultAvatarProps = InferInput<typeof defaultAvatarPropsSchema>;

function DefaultAvatar(props: DefaultAvatarProps) {
  const { 'aria-hidden': ariaHidden, className, fromUser } = validateProps(defaultAvatarPropsSchema, props, 'strict');

  const [{ avatar: avatarStyleSet }] = useStyleSet();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return (
    <div
      aria-hidden={ariaHidden}
      className={classNames(
        'webchat__defaultAvatar',
        { 'webchat__defaultAvatar--fromUser': fromUser },
        rootClassName,
        avatarStyleSet + '',
        className
      )}
    >
      <InitialsAvatar fromUser={fromUser} />
      <ImageAvatar fromUser={fromUser} />
    </div>
  );
}

DefaultAvatar.displayName = 'DefaultAvatar';

export default memo(DefaultAvatar);

export { defaultAvatarPropsSchema, type DefaultAvatarProps };
