import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import CroppedImage from '../Utils/CroppedImage';
import useAvatarForBot from '../hooks/useAvatarForBot';
import useAvatarForUser from '../hooks/useAvatarForUser';
import useStyleSet from '../hooks/useStyleSet';

const ROOT_CSS = css({
  '& .webchat__imageAvatar__image': {
    width: '100%'
  }
});

const ImageAvatar = ({ fromUser }) => {
  const [{ image: avatarImageForBot }] = useAvatarForBot();
  const [{ image: avatarImageForUser }] = useAvatarForUser();
  const [{ imageAvatar: imageAvatarStyleSet }] = useStyleSet();

  const avatarImage = fromUser ? avatarImageForUser : avatarImageForBot;

  return (
    !!avatarImage && (
      <div className={classNames(ROOT_CSS + '', 'webchat__imageAvatar', imageAvatarStyleSet + '')}>
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
