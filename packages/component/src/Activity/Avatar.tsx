import { validateProps } from 'botframework-webchat-api/internal';
import React, { memo } from 'react';
import { boolean, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import { DefaultAvatar } from '../Middleware/Avatar/createCoreMiddleware';

const avatarPropsSchema = pipe(
  object({
    'aria-hidden': optional(boolean(), false), // TODO: Should remove default value.
    className: optional(string(), ''), // TODO: Should remove default value.
    fromUser: optional(boolean(), false) // TODO: Should remove default value.
  }),
  readonly()
);

type AvatarProps = InferInput<typeof avatarPropsSchema>;

/** @deprecated Please use `useRenderAvatar` hook instead. */
function Avatar(props: AvatarProps) {
  const { 'aria-hidden': ariaHidden, className, fromUser } = validateProps(avatarPropsSchema, props);

  console.warn(
    'botframework-webchat: <Avatar> component is deprecated and will be removed on or after 2022-02-25. Please use `useRenderAvatar` hook instead.'
  );

  return <DefaultAvatar aria-hidden={ariaHidden} className={className} fromUser={fromUser} />;
}

export default memo(Avatar);
export { avatarPropsSchema, type AvatarProps };
