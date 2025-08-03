import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import { DefaultAvatar } from '../Middleware/Avatar/createCoreMiddleware';

const avatarPropsSchema = pipe(
  object({
    'aria-hidden': optional(boolean()),
    className: optional(string()),
    fromUser: optional(boolean())
  }),
  readonly()
);

type AvatarProps = InferInput<typeof avatarPropsSchema>;

/** @deprecated Please use `useRenderAvatar` hook instead. */
function Avatar(props: AvatarProps) {
  const { 'aria-hidden': ariaHidden = false, className, fromUser } = validateProps(avatarPropsSchema, props);

  console.warn(
    'botframework-webchat: <Avatar> component is deprecated and will be removed on or after 2022-02-25. Please use `useRenderAvatar` hook instead.'
  );

  return <DefaultAvatar aria-hidden={ariaHidden} className={className} fromUser={fromUser} />;
}

export default memo(Avatar);
export { avatarPropsSchema, type AvatarProps };
