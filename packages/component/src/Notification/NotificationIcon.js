import PropTypes from 'prop-types';
import React from 'react';

import CheckMarkIcon from './CheckMarkIcon';
import ExclamationMarkIcon from './ExclamationMarkIcon';

const NotificationIcon = ({ className, level }) =>
  level === 'success' ? <CheckMarkIcon className={className} /> : <ExclamationMarkIcon className={className} />;

NotificationIcon.defaultProps = {
  className: undefined
};

NotificationIcon.propTypes = {
  className: PropTypes.string,
  level: PropTypes.oneOf(['error', 'info', 'success', 'warn']).isRequired
};

export default NotificationIcon;
