import { hooks } from 'botframework-webchat-api';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import classNames from 'classnames';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, type InferInput } from 'valibot';

import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
import useStyleSet from '../hooks/useStyleSet';

const { useAvatarForBot, useAvatarForUser } = hooks;

const ROOT_STYLE = {
  alignItems: 'center',
  display: 'flex',

  '& .webchat__initialsAvatar__initials': {
    justifyContent: 'center'
  }
};

const initialsAvatarPropsSchema = pipe(
  object({
    fromUser: optional(boolean())
  }),
  readonly()
);

type InitialsAvatarProps = InferInput<typeof initialsAvatarPropsSchema>;

function InitialsAvatar(props: InitialsAvatarProps) {
  const { fromUser = false } = validateProps(initialsAvatarPropsSchema, props);

  const [{ initials: avatarInitialsForBot }] = useAvatarForBot();
  const [{ initials: avatarInitialsForUser }] = useAvatarForUser();
  const [{ initialsAvatar: initialsAvatarStyleSet }] = useStyleSet();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return (
    <div
      className={classNames(
        'webchat__initialsAvatar',
        {
          'webchat__initialsAvatar--fromUser': fromUser
        },
        rootClassName,
        initialsAvatarStyleSet + ''
      )}
    >
      <div className="webchat__initialsAvatar__initials">{fromUser ? avatarInitialsForUser : avatarInitialsForBot}</div>
    </div>
  );
}

export default memo(InitialsAvatar);
export { initialsAvatarPropsSchema, type InitialsAvatarProps };
