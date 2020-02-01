import PropTypes from 'prop-types';
import React from 'react';

const CollapseIcon = ({ className }) => (
  <svg className={(className || '') + ''} width="16" height="9" viewBox="0 0 16 9" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.2734 8.97656L8 1.71094L0.726563 8.97656L0.0234375 8.27344L8 0.289062L15.9766 8.27344L15.2734 8.97656Z" />
  </svg>
);

CollapseIcon.propTypes = {
  className: PropTypes.string
};

export default CollapseIcon;
