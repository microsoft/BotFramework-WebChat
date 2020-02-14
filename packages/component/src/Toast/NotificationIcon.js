import PropTypes from 'prop-types';
import React from 'react';

import CheckMarkIcon from './CheckMarkIcon';
import ExclamationMarkIcon from './ExclamationMarkIcon';
import useLocalize from '../hooks/useLocalize';

const NotificationIcon = ({ className, level }) => {
  const prefixes = {
    error: useLocalize('TOAST_ERROR_PREFIX'),
    info: useLocalize('TOAST_INFO_PREFIX'),
    success: useLocalize('TOAST_SUCCESS_PREFIX'),
    warn: useLocalize('TOAST_WARN_PREFIX')
  };

  const prefix = prefixes[level] || '';

  return (
    <React.Fragment>
      {level === 'success' ? (
        <CheckMarkIcon aria-label={prefix} className={className} />
      ) : (
        <ExclamationMarkIcon aria-label={prefix} className={className} />
      )}
    </React.Fragment>
  );
};

NotificationIcon.defaultProps = {
  className: undefined
};

NotificationIcon.propTypes = {
  className: PropTypes.string,
  level: PropTypes.oneOf(['error', 'info', 'success', 'warn']).isRequired
};

export default NotificationIcon;
