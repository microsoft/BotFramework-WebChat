import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import CroppedImage from '../Utils/CroppedImage';
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

const Avatar = ({ 'aria-hidden': ariaHidden, avatarImage, avatarInitials, className, fromUser }) => {
  const [{ avatar: avatarStyleSet }] = useStyleSet();

  return (
    !!(avatarImage || avatarInitials) && (
      <div
        aria-hidden={ariaHidden}
        className={classNames(avatarStyleSet + '', { 'from-user': fromUser }, className + '')}
      >
        {avatarInitials}
        {!!avatarImage && <CroppedImage alt="" className="image" height="100%" src={avatarImage} width="100%" />}
      </div>
    )
  );
};

Avatar.defaultProps = {
  'aria-hidden': false,
  avatarImage: '',
  avatarInitials: '',
  className: '',
  fromUser: false
};

Avatar.propTypes = {
  'aria-hidden': PropTypes.bool,
  avatarImage: PropTypes.string,
  avatarInitials: PropTypes.string,
  className: PropTypes.string,
  fromUser: PropTypes.bool
};

export default connectAvatar()(Avatar);

export { connectAvatar };
