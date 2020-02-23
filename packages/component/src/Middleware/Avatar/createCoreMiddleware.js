import { css } from 'glamor';
import classNames from 'classnames';
import React from 'react';

import concatMiddleware from '../concatMiddleware';
import ImageAvatar from '../../Avatar/ImageAvatar';
import InitialsAvatar from '../../Avatar/InitialsAvatar';
import useStyleSet from '../../hooks/useStyleSet';

const ROOT_CSS = css({
  position: 'relative',

  '> *': {
    left: 0,
    position: 'absolute',
    top: 0
  }
});

const DefaultAvatar = ({ fromUser }) => {
  const [{ avatar: avatarStyleSet }] = useStyleSet();

  return (
    <div aria-hidden={true} className={classNames(ROOT_CSS + '', 'webchat__defaultAvatar', avatarStyleSet + '')}>
      <InitialsAvatar fromUser={fromUser} />
      <ImageAvatar fromUser={fromUser} />
    </div>
  );
};

export default function createCoreAvatarMiddleware() {
  return concatMiddleware(() => next => ({ fromUser, styleOptions }) => {
    const { botAvatarImage, botAvatarInitials, userAvatarImage, userAvatarInitials } = styleOptions;

    if (fromUser ? botAvatarImage || botAvatarInitials : userAvatarImage || userAvatarInitials) {
      return () => <DefaultAvatar fromUser={fromUser} />;
    }

    return false;
  });
}
