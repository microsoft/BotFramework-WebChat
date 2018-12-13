import classNames from 'classnames';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

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
  avatarImage,
  avatarInitials,
  className,
  fromUser,
  styleSet
}) =>
  !!(avatarImage || avatarInitials) &&
    <div
      className={ classNames(
        styleSet.avatar + '',
        { 'from-user': fromUser },
        (className || '') + ''
      ) }
    >
      { avatarInitials }
      <div
        aria-hidden={ true }
        className="image"
        style={{ backgroundImage: `url(${ encodeURI(backgroundImage) })` }}
      />
    </div>

export default connectAvatar(
  ({ styleSet }) => ({ styleSet })
)(Avatar)

export { connectAvatar }
