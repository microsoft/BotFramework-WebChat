import PropTypes from 'prop-types';
import React from 'react';

const ExpandIcon = ({ className }) => (
  <svg
    className={(className || '') + ''}
    focusable={false}
    height="10"
    role="presentation"
    viewBox="0 0 16 10"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M15.1484 0.648437L15.8516 1.35156L8 9.20312L0.148438 1.35156L0.851563 0.648438L8 7.79687L15.1484 0.648437Z" />
  </svg>
);

ExpandIcon.defaultProps = {
  className: undefined
};

ExpandIcon.propTypes = {
  className: PropTypes.string
};

export default ExpandIcon;
