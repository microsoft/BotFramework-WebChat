import PropTypes from 'prop-types';
import React from 'react';

const DismissIcon = ({ className }) => (
  <svg
    className={(className || '') + ''}
    focusable={false}
    height="14"
    role="presentation"
    viewBox="0 0 14 14"
    width="14"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M7.71094 7L13.1016 12.3984L12.3984 13.1016L7 7.71094L1.60156 13.1016L0.898438 12.3984L6.28906 7L0.898438 1.60156L1.60156 0.898438L7 6.28906L12.3984 0.898438L13.1016 1.60156L7.71094 7Z" />
  </svg>
);

DismissIcon.defaultProps = {
  className: undefined
};

DismissIcon.propTypes = {
  className: PropTypes.string
};

export default DismissIcon;
