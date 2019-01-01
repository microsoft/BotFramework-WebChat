import classNames from 'classnames';
import React from 'react';

import connectToWebChat from '../connectToWebChat';
import CroppedImage from '../Utils/CroppedImage';

const connectAvatar = (...selectors) => connectToWebChat(
  ({
    styleSet: {
      options: {
        botAvatarImage,
        botAvatarInitials,
        userAvatarImage,
        userAvatarInitials
      }
    }
  }, { fromUser }) => ({
    avatarImage: fromUser ? userAvatarImage : botAvatarImage,
    avatarInitials: fromUser ? userAvatarInitials : botAvatarInitials
  }),
  ...selectors
);

// TODO: [P2] Consider memoizing "style={ backgroundImage }" in our upstreamers
//       We have 2 different upstreamers <CarouselFilmStrip> and <StackedLayout>

const Avatar = ({
  'aria-hidden': ariaHidden,
  avatarImage,
  avatarInitials,
  className,
  fromUser,
  styleSet
}) =>
  !!(avatarImage || avatarInitials) &&
    <div
      aria-hidden={ ariaHidden }
      className={ classNames(
        styleSet.avatar + '',
        { 'from-user': fromUser },
        (className || '') + ''
      ) }
    >
      { avatarInitials }
      { !!avatarImage &&
        <CroppedImage
          alt=""
          className="image"
          height="100%"
          src={ avatarImage }
          width="100%"
        />
      }
    </div>

export default connectAvatar(
  ({ styleSet }) => ({ styleSet })
)(Avatar)

export { connectAvatar }
