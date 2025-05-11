import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo, useRef, type MouseEventHandler } from 'react';
import {
  boolean,
  custom,
  function_,
  object,
  optional,
  pipe,
  readonly,
  safeParse,
  string,
  type InferInput
} from 'valibot';

import AccessibleButton from '../Utils/AccessibleButton';
import parseProps from '../Utils/parseProps';
import useFocusVisible from '../hooks/internal/useFocusVisible';
import useStyleSet from '../hooks/useStyleSet';
import reactNode from '../types/internal/reactNode';

const { useStyleOptions } = hooks;

const iconButtonPropsSchema = pipe(
  object({
    alt: optional(string(), ''), // TODO: Should remove default value.
    children: optional(reactNode()),
    className: optional(string(), ''), // TODO: Should remove default value.
    disabled: optional(boolean(), false), // TODO: Should remove default value.
    onClick: optional(custom<MouseEventHandler<HTMLButtonElement>>(value => safeParse(function_(), value).success))
  }),
  readonly()
);

type IconButtonProps = InferInput<typeof iconButtonPropsSchema>;

function IconButton(props: IconButtonProps) {
  const { alt, children, className, disabled, onClick } = parseProps(iconButtonPropsSchema, props);

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
}

export default memo(IconButton);
export { iconButtonPropsSchema, type IconButtonProps };
