import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import concatMiddleware from '../concatMiddleware';
import ImageAvatar from '../../Avatar/ImageAvatar';
import InitialsAvatar from '../../Avatar/InitialsAvatar';
import useStyleSet from '../../hooks/useStyleSet';
import useStyleToClassName from '../../hooks/internal/useStyleToClassName';

const ROOT_STYLE = {
  overflow: 'hidden',
  position: 'relative',

  '> *': {
    left: 0,
    position: 'absolute',
    top: 0
  }
};

const DefaultAvatar = ({ 'aria-hidden': ariaHidden, className, fromUser }) => {
  const [{ avatar: avatarStyleSet }] = useStyleSet();
  const rootClassName = useStyleToClassName()(ROOT_STYLE);

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

export default function createCoreAvatarMiddleware() {
  return concatMiddleware(() => () => ({ fromUser, styleOptions }) => {
    const { botAvatarImage, botAvatarInitials, userAvatarImage, userAvatarInitials } = styleOptions;

    if (fromUser ? userAvatarImage || userAvatarInitials : botAvatarImage || botAvatarInitials) {
      // eslint-disable-next-line react/display-name
      return () => <DefaultAvatar fromUser={fromUser} />;
    }

    return false;
  });
}

export { DefaultAvatar };
