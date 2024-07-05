import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo } from 'react';

import FixedWidthImage from '../Utils/FixedWidthImage';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';
import useStyleSet from '../hooks/useStyleSet';

const { useAvatarForBot, useAvatarForUser } = hooks;

const ROOT_STYLE = {
  '& .webchat__imageAvatar__image': {
    width: '100%'
  }
};

const ImageAvatar = memo(({ fromUser }: Readonly<{ fromUser: boolean }>) => {
  const [{ image: avatarImageForBot }] = useAvatarForBot();
  const [{ image: avatarImageForUser }] = useAvatarForUser();
  const [{ imageAvatar: imageAvatarStyleSet }] = useStyleSet();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  const avatarImage = fromUser ? avatarImageForUser : avatarImageForBot;

  return (
    !!avatarImage && (
      <div className={classNames('webchat__imageAvatar', rootClassName, imageAvatarStyleSet + '')}>
        <FixedWidthImage
          alt=""
          className="webchat__imageAvatar__image"
          src={fromUser ? avatarImageForUser : avatarImageForBot}
        />
      </div>
    )
  );
});

export default ImageAvatar;
