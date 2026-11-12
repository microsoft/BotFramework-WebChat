import { hooks } from 'botframework-webchat-api';
import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo, useRef, type MouseEventHandler } from 'react';
import { boolean, custom, function_, is, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import useFocusVisible from '../hooks/internal/useFocusVisible';
import AccessibleButton from '../Utils/AccessibleButton';
import styles from './SendBox.module.css';

const { useStyleOptions } = hooks;

const iconButtonPropsSchema = pipe(
  object({
    alt: optional(string()),
    children: optional(reactNode()),
    className: optional(string()),
    'data-testid': optional(string()),
    disabled: optional(boolean()),
    onClick: optional(custom<MouseEventHandler<HTMLButtonElement>>(value => is(function_(), value)))
  }),
  readonly()
);

type IconButtonProps = InferInput<typeof iconButtonPropsSchema>;

function IconButton(props: IconButtonProps) {
  const {
    alt,
    children,
    className,
    'data-testid': dataTestid,
    disabled,
    onClick
  } = validateProps(iconButtonPropsSchema, props);

  const classNames = useStyles(styles, webChatPrefixedClassName);
  const [{ sendBoxButtonAlignment }] = useStyleOptions();
  const buttonRef = useRef<HTMLButtonElement>();

  const [focusVisible] = useFocusVisible(buttonRef);

  return (
    <AccessibleButton
      aria-label={alt}
      className={cx(
        classNames['icon-button'],
        {
          [classNames['icon-button--focus-visible']]: focusVisible,
          [classNames['icon-button--stretch']]: sendBoxButtonAlignment !== 'bottom' && sendBoxButtonAlignment !== 'top'
        },
        className
      )}
      data-testid={dataTestid}
      disabled={disabled}
      onClick={disabled ? undefined : onClick}
      ref={buttonRef}
      title={alt}
      type="button"
    >
      <div className={classNames['icon-button__shade']} />
      {children}
      <div className={classNames['icon-button__keyboard-focus-indicator']} />
    </AccessibleButton>
  );
}

export default memo(IconButton);
export { iconButtonPropsSchema, type IconButtonProps };
