import { reactNode, validateProps } from 'botframework-webchat-react-valibot';
import classNames from 'classnames';
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

import useStyleSet from '../../../hooks/useStyleSet';
import MonochromeImageMasker from '../../../Utils/MonochromeImageMasker';

const activityButtonPropsSchema = pipe(
  object({
    children: optional(reactNode()),
    className: optional(string()),
    'data-testid': optional(string()),
    disabled: optional(boolean()),
    iconURL: optional(string()),
    onClick: optional(custom<() => void>(value => safeParse(function_(), value).success)),
    text: optional(string())
  }),
  readonly()
);

type ActivityButtonProps = InferInput<typeof activityButtonPropsSchema>;

const ActivityButton = forwardRef<HTMLButtonElement, ActivityButtonProps>((props, ref) => {
  const {
    children,
    className,
    'data-testid': dataTestId,
    disabled,
    iconURL,
    onClick,
    text
  } = validateProps(activityButtonPropsSchema, props);

  const [{ activityButton }] = useStyleSet();
  const onClickRef = useRefFrom(onClick);

  const handleClick = useCallback(() => onClickRef.current?.(), [onClickRef]);

  return (
    <button
      aria-disabled={disabled ? 'true' : undefined}
      className={classNames(activityButton, 'webchat__activity-button', className)}
      data-testid={dataTestId}
      onClick={disabled ? undefined : handleClick}
      ref={ref}
      // eslint-disable-next-line no-magic-numbers
      tabIndex={disabled ? -1 : undefined}
      type="button"
    >
      {iconURL && <MonochromeImageMasker className="webchat__activity-button__icon" src={iconURL} />}
      {text && <span className="webchat__activity-button__text">{text}</span>}
      {children}
    </button>
  );
});

export default memo(ActivityButton);
export { activityButtonPropsSchema, type ActivityButtonProps };
