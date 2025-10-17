import { forwardedRef, reactNode, refObject, validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import { useRefFrom } from 'use-ref-from';
import { function_, object, optional, picklist, pipe, readonly, string, type InferInput } from 'valibot';

import styles from './Button.module.css';

const buttonPropsSchema = pipe(
  object({
    appearance: optional(picklist(['flat', 'elevated'])),
    children: optional(reactNode()),
    className: optional(string()),
    forwardedRef: optional(forwardedRef<HTMLElement>()),
    onClick: optional(function_()),
    popoverTargetAction: optional(picklist(['hide', 'show', 'toggle'])),
    popoverTargetRef: optional(refObject<HTMLElement>()),
    size: optional(picklist(['hero', 'normal']))
  }),
  readonly()
);

type ButtonProps = InferInput<typeof buttonPropsSchema>;

function Button(props: ButtonProps) {
  const { appearance, children, className, onClick, popoverTargetAction, popoverTargetRef, size } = validateProps(
    buttonPropsSchema,
    props
  );
  const classNames = useStyles(styles);

  const onClickRef = useRefFrom(onClick);
  const ref = useRef<HTMLButtonElement>(null);

  const handleClick = useCallback(() => onClickRef.current?.(), [onClickRef]);

  useEffect(() => {
    if (ref.current) {
      if (popoverTargetAction) {
        ref.current.popoverTargetAction = popoverTargetAction;
      } else {
        ref.current.removeAttribute('popovertargetaction');
      }

      ref.current.popoverTargetElement = popoverTargetRef?.current || null;
    }
  }, [popoverTargetAction, popoverTargetRef, ref]);

  return (
    <button
      className={cx(
        classNames['button'],
        {
          [classNames['button--appearance-elevated']]: appearance === 'elevated',
          [classNames['button--size-hero']]: size === 'hero'
        },
        className
      )}
      onClick={handleClick}
      ref={ref}
      type="button"
    >
      {children}
    </button>
  );
}

Button.displayName = 'Button';

export default memo(Button);
export { buttonPropsSchema, type ButtonProps };
