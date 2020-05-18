import PropTypes from 'prop-types';
import React, { forwardRef, useRef } from 'react';

import useDisableOnBlurEffect from '../hooks/internal/useDisableOnBlurEffect';

const AccessibleTextArea = forwardRef(({ disabled, onChange, ...props }, forwardedRef) => {
  const targetRef = useRef();

  const ref = forwardedRef || targetRef;

  useDisableOnBlurEffect(ref, disabled);

  return (
    <textarea
      aria-disabled={disabled || undefined}
      onChange={disabled ? undefined : onChange}
      readOnly={disabled}
      ref={ref}
      {...props}
    />
  );
});

AccessibleTextArea.defaultProps = {
  disabled: undefined,
  onChange: undefined
};

AccessibleTextArea.propTypes = {
  disabled: PropTypes.bool,
  onChange: PropTypes.func
};

export default AccessibleTextArea;
