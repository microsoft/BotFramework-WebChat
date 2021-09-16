import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { FC, MouseEventHandler, ReactNode, useRef } from 'react';

import AccessibleButton from '../Utils/AccessibleButton';
import useFocusVisible from '../hooks/internal/useFocusVisible';
import useStyleSet from '../hooks/useStyleSet';

const { useStyleOptions } = hooks;

type IconButtonProps = {
  alt?: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement>;
};

const IconButton: FC<IconButtonProps> = ({ alt, children, className, disabled, onClick }) => {
  const [{ sendBoxButton: sendBoxButtonStyleSet }] = useStyleSet();
  const [{ sendBoxButtonAlignment }] = useStyleOptions();
  const buttonRef = useRef<HTMLButtonElement>();

  const [focusVisible] = useFocusVisible(buttonRef);

  return (
    <AccessibleButton
      className={classNames(
        sendBoxButtonStyleSet + '',
        'webchat__icon-button',
        {
          'webchat__icon-button--focus-visible': focusVisible,
          'webchat__icon-button--stretch': sendBoxButtonAlignment !== 'bottom' && sendBoxButtonAlignment !== 'top'
        },
        className + ''
      )}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      ref={buttonRef}
      title={alt}
      type="button"
    >
      <div className="webchat__icon-button__shade" />
      {children}
      <div className="webchat__icon-button__keyboard-focus-indicator" />
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
