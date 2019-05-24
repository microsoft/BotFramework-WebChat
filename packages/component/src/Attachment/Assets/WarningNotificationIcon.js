import PropTypes from 'prop-types';
import React from 'react';

const ICON_SIZE_FACTOR = 16;

const WarningNotificationIcon = ({ className, size }) => (
  <svg
    alt=""
    className={className}
    height={ICON_SIZE_FACTOR * size}
    viewBox="0 0 13.1 13.1"
    width={ICON_SIZE_FACTOR * size}
  >
    <path d="M13.1,13.1H0L6.6,0L13.1,13.1z M7,10.5H6.1v0.9H7V10.5z M7,9.7V5.2H6.1v4.4L7,9.7z" fillRule="evenodd" />
  </svg>
);

WarningNotificationIcon.defaultProps = {
  className: '',
  size: 1
};

WarningNotificationIcon.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number
};

export default WarningNotificationIcon;
