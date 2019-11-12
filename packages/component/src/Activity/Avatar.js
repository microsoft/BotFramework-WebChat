import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import CroppedImage from '../Utils/CroppedImage';
import useAvatarForBot from '../hooks/useAvatarForBot';
import useAvatarForUser from '../hooks/useAvatarForUser';
import useStyleSet from '../hooks/useStyleSet';

const connectAvatar = (...selectors) =>
  connectToWebChat(
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

// TODO: [P2] Consider memoizing "style={ backgroundImage }" in our upstreamers
//       We have 2 different upstreamers <CarouselFilmStrip> and <StackedLayout>

const Avatar = ({ 'aria-hidden': ariaHidden, className, fromUser }) => {
  const [botAvatar] = useAvatarForBot();
  const [userAvatar] = useAvatarForUser();
  const [{ avatar: avatarStyleSet }] = useStyleSet();

  const { image, initials } = fromUser ? userAvatar : botAvatar;

  return (
    !!(image || initials) && (
      <div
        aria-hidden={ariaHidden}
        className={classNames(avatarStyleSet + '', { 'from-user': fromUser }, className + '')}
      >
        {initials}
        {!!image && <CroppedImage alt="" className="image" height="100%" src={image} width="100%" />}
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

export { connectAvatar };
