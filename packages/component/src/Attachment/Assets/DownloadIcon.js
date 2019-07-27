import PropTypes from 'prop-types';
import React from 'react';

const ICON_SIZE_FACTOR = 22;

const DownloadIcon = ({ className, size }) => (
  <svg className={className} height={ICON_SIZE_FACTOR * size} viewBox="0 0 31.8 46" width={ICON_SIZE_FACTOR * size}>
    <path d="M26.8,23.8l-10.9,11L5,23.8l1.6-1.6l8.2,8.3V5H17v25.5l8.2-8.3L26.8,23.8z M5.8,41v-2.2H26V41H5.8z" />
  </svg>
);

DownloadIcon.defaultProps = {
  className: '',
  size: 1
};

DownloadIcon.propTypes = {
  className: PropTypes.string,
  size: PropTypes.number
};

export default DownloadIcon;
