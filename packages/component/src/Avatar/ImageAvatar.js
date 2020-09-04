import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import CroppedImage from '../Utils/CroppedImage';
import useAvatarForBot from '../hooks/useAvatarForBot';
import useAvatarForUser from '../hooks/useAvatarForUser';
import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

const ROOT_STYLE = {
  '& .webchat__imageAvatar__image': {
    width: '100%'
  }
};

const ImageAvatar = ({ fromUser }) => {
  const [{ image: avatarImageForBot }] = useAvatarForBot();
  const [{ image: avatarImageForUser }] = useAvatarForUser();
  const [{ imageAvatar: imageAvatarStyleSet }] = useStyleSet();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  const avatarImage = fromUser ? avatarImageForUser : avatarImageForBot;

  return (
    !!avatarImage && (
      <div className={classNames('webchat__imageAvatar', rootClassName, imageAvatarStyleSet + '')}>
        <CroppedImage
          alt=""
          className="webchat__imageAvatar__image"
          height="100%"
          src={fromUser ? avatarImageForUser : avatarImageForBot}
          width="100%"
        />
      </div>
    )
  );
};

ImageAvatar.defaultProps = {
  fromUser: false
};

ImageAvatar.propTypes = {
  fromUser: PropTypes.bool
};

export default ImageAvatar;
