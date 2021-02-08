import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

const FocusRedirector = ({ className, onFocus, redirectRef }) => {
  const handleFocus = useCallback(() => {
    const { current } = redirectRef;

    current && current.focus();
    onFocus && onFocus();
  }, [onFocus, redirectRef]);

  return <div className={className} onFocus={handleFocus} tabIndex={0} />;
};

FocusRedirector.defaultProps = {
  className: undefined,
  onFocus: undefined
};

FocusRedirector.propTypes = {
  className: PropTypes.string,
  onFocus: PropTypes.func,
  redirectRef: PropTypes.shape({
    current: PropTypes.any
  }).isRequired
};

export default FocusRedirector;
