import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import useStyleSet from '../hooks/useStyleSet';

const IconButton = ({ alt, children, className, disabled, onClick }) => {
  const [{ sendBoxButton: sendBoxButtonStyleSet }] = useStyleSet();

  return (
    <div className={classNames(sendBoxButtonStyleSet + '', 'webchat__icon-button', className + '')}>
      <button
        aria-disabled={disabled}
        className="webchat__icon-button__button"
        onClick={disabled ? undefined : onClick}
        title={alt}
        type="button"
      >
        {children}
      </button>
      {disabled && <div className="webchat__icon-button__glass" />}
    </div>
  );
};

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
  onClick: PropTypes.func
};

export default IconButton;
