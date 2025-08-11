import { AvatarMiddleware } from 'botframework-webchat-api';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import classNames from 'classnames';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

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
    'aria-hidden': optional(boolean()),
    className: optional(string()),
    fromUser: boolean()
  }),
  readonly()
);

type DefaultAvatarProps = InferInput<typeof defaultAvatarPropsSchema>;

function DefaultAvatar(props: DefaultAvatarProps) {
  const { 'aria-hidden': ariaHidden = true, className, fromUser } = validateProps(defaultAvatarPropsSchema, props);

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

export default function createCoreAvatarMiddleware(): AvatarMiddleware[] {
  return [
    () =>
      () =>
      ({ fromUser, styleOptions }) => {
        const { botAvatarImage, botAvatarInitials, userAvatarImage, userAvatarInitials } = styleOptions;

        if (fromUser ? userAvatarImage || userAvatarInitials : botAvatarImage || botAvatarInitials) {
          return () => <DefaultAvatar fromUser={fromUser} />;
        }

        return false;
      }
  ];
}

const MemoizedDefaultAvatar = memo(DefaultAvatar);

export { MemoizedDefaultAvatar as DefaultAvatar, defaultAvatarPropsSchema, type DefaultAvatarProps };
