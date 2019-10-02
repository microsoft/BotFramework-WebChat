import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import connectToWebChat from '../connectToWebChat';

const IconButton = ({ alt, children, className, disabled, onClick, styleSet }) => (
  <button
    className={classNames(styleSet.sendBoxButton + '', className + '')}
    disabled={disabled}
    onClick={onClick}
    title={alt}
    type="button"
  >
    {children}
  </button>
);

IconButton.defaultProps = {
  alt: '',
  children: undefined,
  className: '',
  disabled: false,
  onClick: undefined
};

IconButton.propTypes = {
  alt: PropTypes.string,
  children: PropTypes.any,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  onClick: PropTypes.func,
  styleSet: PropTypes.shape({
    sendBoxButton: PropTypes.any.isRequired
  }).isRequired
};

export default connectToWebChat(({ styleSet }) => ({ styleSet }))(IconButton);
