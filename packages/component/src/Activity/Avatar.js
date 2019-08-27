import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import CroppedImage from '../Utils/CroppedImage';
import useStyleSet from '../hooks/useStyleSet';
import useWebChat from '../useWebChat';

const connectAvatar = (...selectors) => {
  console.warn('Web Chat: connectAvatar() will be removed on or after 2021-09-27, please use useAvatar() instead.');

  return connectToWebChat(
    (
      {
        styleSet: {
          options: { botAvatarImage, botAvatarInitials, userAvatarImage, userAvatarInitials }
        }
      },
      { fromUser }
    ) => ({
      avatarImage: fromUser ? userAvatarImage : botAvatarImage,
      avatarInitials: fromUser ? userAvatarInitials : botAvatarInitials
    }),
    ...selectors
  );
};

const useAvatar = ({ fromUser }) => {
  const {
    styleSet: {
      options: { botAvatarImage, botAvatarInitials, userAvatarImage, userAvatarInitials }
    }
  } = useWebChat(state => state);

  return {
    avatarImage: fromUser ? userAvatarImage : botAvatarImage,
    avatarInitials: fromUser ? userAvatarInitials : botAvatarInitials
  };
};

// TODO: [P2] Consider memoizing "style={ backgroundImage }" in our upstreamers
//       We have 2 different upstreamers <CarouselFilmStrip> and <StackedLayout>

const Avatar = ({ 'aria-hidden': ariaHidden, className, fromUser }) => {
  const { avatarImage, avatarInitials } = useAvatar({ fromUser });
  const styleSet = useStyleSet();

  return (
    !!(avatarImage || avatarInitials) && (
      <div
        aria-hidden={ariaHidden}
        className={classNames(styleSet.avatar + '', { 'from-user': fromUser }, className + '')}
      >
        {avatarInitials}
        {!!avatarImage && <CroppedImage alt="" className="image" height="100%" src={avatarImage} width="100%" />}
      </div>
    )
  );
};

Avatar.defaultProps = {
  'aria-hidden': false,
  className: '',
  fromUser: false
};

Avatar.propTypes = {
  'aria-hidden': PropTypes.bool,
  className: PropTypes.string,
  fromUser: PropTypes.bool
};

export default Avatar;

export { connectAvatar, useAvatar };
