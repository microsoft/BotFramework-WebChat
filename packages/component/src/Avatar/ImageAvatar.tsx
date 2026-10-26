import { validateProps, type InferReactProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import React, { memo } from 'react';
import { boolean, object, pipe, readonly } from 'valibot';

import styles from './ImageAvatar.module.css';

const { useAvatarForBot, useAvatarForUser } = hooks;

const imageAvatarPropsSchema = pipe(
  object({
    fromUser: boolean()
  }),
  readonly()
);

type ImageAvatarProps = InferReactProps<typeof imageAvatarPropsSchema>;

const ImageAvatar = (props: ImageAvatarProps) => {
  const { fromUser } = validateProps(imageAvatarPropsSchema, props);

  const [{ image: avatarImageForBot }] = useAvatarForBot();
  const [{ image: avatarImageForUser }] = useAvatarForUser();
  const classNames = useStyles(styles);

  const avatarImage = fromUser ? avatarImageForUser : avatarImageForBot;

  return (
    !!avatarImage && (
      <div className={classNames['imageAvatar']}>
        <img alt="" className={classNames['imageAvatar__image']} src={avatarImage} />
      </div>
    )
  );
};

export default memo(ImageAvatar);
export { imageAvatarPropsSchema, type ImageAvatarProps };
