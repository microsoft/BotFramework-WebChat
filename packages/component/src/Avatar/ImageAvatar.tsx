import { hooks } from 'botframework-webchat-api';
import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import classNames from 'classnames';
import React, { memo } from 'react';
import { boolean, object, pipe, readonly, type InferInput } from 'valibot';

import { useStyleToEmotionObject } from '../hooks/internal/styleToEmotionObject';
import useStyleSet from '../hooks/useStyleSet';

const { useAvatarForBot, useAvatarForUser } = hooks;

const ROOT_STYLE = {
  '& .webchat__imageAvatar__image': {
    width: '100%',
    height: 'auto'
  }
};

const imageAvatarPropsSchema = pipe(
  object({
    fromUser: boolean()
  }),
  readonly()
);

type ImageAvatarProps = InferInput<typeof imageAvatarPropsSchema>;

const ImageAvatar = (props: ImageAvatarProps) => {
  const { fromUser } = validateProps(imageAvatarPropsSchema, props);

  const [{ image: avatarImageForBot }] = useAvatarForBot();
  const [{ image: avatarImageForUser }] = useAvatarForUser();
  const [{ imageAvatar: imageAvatarStyleSet }] = useStyleSet();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  const avatarImage = fromUser ? avatarImageForUser : avatarImageForBot;

  return (
    !!avatarImage && (
      <div className={classNames('webchat__imageAvatar', rootClassName, imageAvatarStyleSet + '')}>
        <img alt="" className="webchat__imageAvatar__image" src={fromUser ? avatarImageForUser : avatarImageForBot} />
      </div>
    )
  );
};

export default memo(ImageAvatar);
export { imageAvatarPropsSchema, type ImageAvatarProps };
