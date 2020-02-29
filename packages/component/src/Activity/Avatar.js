import PropTypes from 'prop-types';
import React from 'react';

import { DefaultAvatar } from '../Middleware/Avatar/createCoreMiddleware';

const Avatar = ({ 'aria-hidden': ariaHidden, className, fromUser }) => {
  console.warn(
    'botframework-webchat: <Avatar> component is deprecated and will be removed on or after 2022-02-25. Please use `useRenderAvatar` hook instead.'
  );

  return <DefaultAvatar aria-hidden={ariaHidden} className={className} fromUser={fromUser} />;
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
