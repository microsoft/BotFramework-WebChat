import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import useAvatarForBot from '../hooks/useAvatarForBot';
import useAvatarForUser from '../hooks/useAvatarForUser';
import useStyleSet from '../hooks/useStyleSet';

const ROOT_CSS = css({
  alignItems: 'center',
  display: 'flex',

  '& .webchat__initialsAvatar__initials': {
    justifyContent: 'center'
  }
});

const InitialsAvatar = ({ fromUser }) => {
  const [{ initials: avatarInitialsForBot }] = useAvatarForBot();
  const [{ initials: avatarInitialsForUser }] = useAvatarForUser();
  const [{ initialsAvatar: initialsAvatarStyleSet }] = useStyleSet();

  return (
    <div
      className={classNames(
        ROOT_CSS + '',
        'webchat__initialsAvatar',
        fromUser && 'webchat__initialsAvatar--fromUser',
        initialsAvatarStyleSet + ''
      )}
    >
      <div className="webchat__initialsAvatar__initials">{fromUser ? avatarInitialsForUser : avatarInitialsForBot}</div>
    </div>
  );
};

InitialsAvatar.defaultProps = {
  fromUser: false
};

InitialsAvatar.propTypes = {
  fromUser: PropTypes.bool
};

export default InitialsAvatar;
