import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import useStyleSet from '../hooks/useStyleSet';
import useStyleToEmotionObject from '../hooks/internal/useStyleToEmotionObject';

const { useAvatarForBot, useAvatarForUser } = hooks;

const ROOT_STYLE = {
  alignItems: 'center',
  display: 'flex',

  '& .webchat__initialsAvatar__initials': {
    justifyContent: 'center'
  }
};

const InitialsAvatar = ({ fromUser }) => {
  const [{ initials: avatarInitialsForBot }] = useAvatarForBot();
  const [{ initials: avatarInitialsForUser }] = useAvatarForUser();
  const [{ initialsAvatar: initialsAvatarStyleSet }] = useStyleSet();
  const rootClassName = useStyleToEmotionObject()(ROOT_STYLE) + '';

  return (
    <div
      className={classNames(
        'webchat__initialsAvatar',
        {
          'webchat__initialsAvatar--fromUser': fromUser
        },
        rootClassName,
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
