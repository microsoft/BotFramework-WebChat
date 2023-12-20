import { AvatarMiddleware } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { type ReactNode } from 'react';

import ImageAvatar from '../../Avatar/ImageAvatar';
import InitialsAvatar from '../../Avatar/InitialsAvatar';
import useStyleSet from '../../hooks/useStyleSet';
import useStyleToEmotionObject from '../../hooks/internal/useStyleToEmotionObject';

const ROOT_STYLE = {
  overflow: 'hidden',
  position: 'relative',

  '> *': {
    left: 0,
    position: 'absolute',
    top: 0
  }
};

type DefaultAvatarProps = Readonly<{
  'aria-hidden'?: boolean;
  className?: string;
  fromUser: boolean;
}>;

const DefaultAvatar = ({ 'aria-hidden': ariaHidden, className, fromUser }: DefaultAvatarProps): ReactNode => {
  const [{ avatar: avatarStyleSet }] = useStyleSet();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return (
    <div
      aria-hidden={ariaHidden}
      className={classNames(
        'webchat__defaultAvatar',
        { 'webchat__defaultAvatar--fromUser': fromUser },
        rootClassName,
        avatarStyleSet + '',
        (className || '') + ''
      )}
    >
      <InitialsAvatar fromUser={fromUser} />
      <ImageAvatar fromUser={fromUser} />
    </div>
  );
};

DefaultAvatar.defaultProps = {
  'aria-hidden': true,
  className: ''
};

DefaultAvatar.propTypes = {
  'aria-hidden': PropTypes.bool,
  className: PropTypes.string,
  fromUser: PropTypes.bool.isRequired
};

export default function createCoreAvatarMiddleware(): AvatarMiddleware[] {
  return [
    () =>
      () =>
      ({ fromUser, styleOptions }) => {
        const { botAvatarImage, botAvatarInitials, userAvatarImage, userAvatarInitials } = styleOptions;

        if (fromUser ? userAvatarImage || userAvatarInitials : botAvatarImage || botAvatarInitials) {
          return () => <DefaultAvatar fromUser={fromUser} />;
        }

        return false;
      }
  ];
}

export { DefaultAvatar };
