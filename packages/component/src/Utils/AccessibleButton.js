import PropTypes from 'prop-types';
import React, { forwardRef, useRef } from 'react';

import useDisableOnBlurEffect from '../hooks/internal/useDisableOnBlurEffect';

const PREVENT_DEFAULT_HANDLER = event => event.preventDefault();

const AccessibleButton = forwardRef(({ disabled, onClick, ...props }, forwardedRef) => {
  const targetRef = useRef();

  const ref = forwardedRef || targetRef;

  useDisableOnBlurEffect(ref, disabled);

  return (
    <button
      aria-disabled={disabled || undefined}
      onClick={disabled ? PREVENT_DEFAULT_HANDLER : onClick}
      ref={ref}
      {...props}
    />
  );
});

AccessibleButton.defaultProps = {
  disabled: undefined,
  onClick: undefined
};

AccessibleButton.propTypes = {
  disabled: PropTypes.bool,
  onClick: PropTypes.func
};

export default AccessibleButton;
