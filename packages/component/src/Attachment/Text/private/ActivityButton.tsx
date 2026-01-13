import { reactNode, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { forwardRef, memo, useCallback } from 'react';
import { useRefFrom } from 'use-ref-from';
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

import { ComponentIcon, componentIconPropsSchema } from '../../../Icon';

import styles from './ActivityButton.module.css';

const activityButtonPropsSchema = pipe(
  object({
    'aria-controls': optional(string()),
    'aria-expanded': optional(boolean()),
    'aria-pressed': optional(boolean()),
    children: optional(reactNode()),
    className: optional(string()),
    'data-testid': optional(string()),
    disabled: optional(boolean()),
    icon: componentIconPropsSchema.entries.icon,
    onClick: optional(custom<() => void>(value => safeParse(function_(), value).success)),
    text: optional(string())
  }),
  readonly()
);

type ActivityButtonProps = InferInput<typeof activityButtonPropsSchema>;

const ActivityButton = forwardRef<HTMLButtonElement, ActivityButtonProps>((props, ref) => {
  const {
    'aria-controls': ariaControls,
    'aria-expanded': ariaExpanded,
    'aria-pressed': ariaPressed,
    children,
    className,
    'data-testid': dataTestId,
    disabled,
    icon,
    onClick,
    text
  } = validateProps(activityButtonPropsSchema, props);

  const classNames = useStyles(styles);
  const onClickRef = useRefFrom(onClick);

  const handleClick = useCallback(() => onClickRef.current?.(), [onClickRef]);

  return (
    <button
      aria-controls={ariaControls}
      aria-disabled={disabled ? 'true' : undefined}
      aria-expanded={ariaExpanded}
      aria-pressed={ariaPressed}
      className={cx(classNames['activity-button'], className)}
      data-testid={dataTestId}
      onClick={disabled ? undefined : handleClick}
      ref={ref}
      // eslint-disable-next-line no-magic-numbers
      tabIndex={disabled ? -1 : undefined}
      type="button"
    >
      {icon && <ComponentIcon appearance="text" className={classNames['activity-button__icon']} icon={icon} />}
      {text && <span className="activity-button__text">{text}</span>}
      {children}
    </button>
  );
});

export default memo(ActivityButton);
export { activityButtonPropsSchema, type ActivityButtonProps };
