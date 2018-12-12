import classNames from 'classnames';
import memoize from 'memoize-one';
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

class Avatar extends React.Component {
  constructor() {
    super();

    this.createBackgroundImageStyle = memoize(backgroundImage => ({ backgroundImage: `url(${ encodeURI(backgroundImage) })` }));
  }

  render() {
    const {
      props: {
        avatarImage,
        avatarInitials,
        className,
        fromUser,
        styleSet
      }
    } = this;

    return (
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
            style={ this.createBackgroundImageStyle(avatarImage) }
          />
        </div>
    );
  }
}

export default connectAvatar(
  ({ styleSet }) => ({ styleSet })
)(Avatar)

export { connectAvatar }
