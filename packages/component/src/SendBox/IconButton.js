import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import useStyleSet from '../../lib/hooks/useStyleSet';

const IconButton = ({ alt, children, className, disabled, onClick }) => {
  const styleSet = useStyleSet();

  return (
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
