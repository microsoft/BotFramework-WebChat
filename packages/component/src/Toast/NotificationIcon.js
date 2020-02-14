import PropTypes from 'prop-types';
import React from 'react';

import CheckMarkIcon from './CheckMarkIcon';
import ExclamationMarkIcon from './ExclamationMarkIcon';
import useLocalizer from '../hooks/useLocalizer';

const NotificationIcon = ({ className, level }) => {
  const localize = useLocalizer();

  const prefixes = {
    error: localize('TOAST_ALT_ERROR'),
    info: localize('TOAST_ALT_INFO'),
    success: localize('TOAST_ALT_SUCCESS'),
    warn: localize('TOAST_ALT_WARN')
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
