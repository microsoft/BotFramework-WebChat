import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import AccessibleButton from '../Utils/AccessibleButton';
import useStyleSet from '../hooks/useStyleSet';

const IconButton = ({ alt, children, className, disabled, onClick }) => {
  const [{ sendBoxButton: sendBoxButtonStyleSet }] = useStyleSet();

  return (
    <AccessibleButton
      className={classNames(sendBoxButtonStyleSet + '', 'webchat__icon-button', className + '')}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      title={alt}
      type="button"
    >
      {children}
    </AccessibleButton>
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
