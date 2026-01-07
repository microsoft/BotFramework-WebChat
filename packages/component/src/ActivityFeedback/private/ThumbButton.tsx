import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { forwardRef, memo, useCallback, useMemo, type ForwardedRef, type KeyboardEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';
import { boolean, function_, literal, object, optional, pipe, readonly, string, union, type InferInput } from 'valibot';

import testIds from '../../testIds';
import { Tooltip } from '../../Tooltip';
import ThumbButtonImage from './ThumbButton.Image';

import styles from './ThumbButton.module.css';

const { useLocalizer } = hooks;

const thumbButtonPropsSchema = pipe(
  object({
    as: union([literal('button'), literal('radio')]),
    className: optional(string()),
    direction: union([literal('down'), literal('up')]),
    disabled: optional(boolean()),
    name: string(),
    onClick: optional(function_()),
    pressed: optional(boolean()),
    size: union([literal('small'), literal('large')]),
    submitted: optional(boolean()),
    title: optional(string())
  }),
  readonly()
);

type ThumbButtonProps = InferInput<typeof thumbButtonPropsSchema>;

function ThumbButton(props: ThumbButtonProps, ref: ForwardedRef<HTMLInputElement>) {
  const { as, className, direction, disabled, name, onClick, pressed, size, submitted, title } = validateProps(
    thumbButtonPropsSchema,
    props
  );

  const localize = useLocalizer();
  const onClickRef = useRefFrom(onClick);
  const classNames = useStyles(styles);

  const buttonTitle = useMemo(
    () => title ?? localize(direction === 'down' ? 'VOTE_DISLIKE_ALT' : 'VOTE_LIKE_ALT'),
    [direction, localize, title]
  );

  const handleClickOrChange = useCallback(() => !disabled && onClickRef.current?.(), [disabled, onClickRef]);

  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(event => {
    // Do not submit the <form> via ENTER key.
    event.key === 'Enter' && event.preventDefault();
  }, []);

  return (
    <div
      className={cx(
        classNames['thumb-button'],
        {
          [classNames['thumb-button--large']]: size === 'large',
          [classNames['thumb-button--has-submitted']]: submitted
        },
        className
      )}
    >
      <input
        aria-disabled={disabled ? 'true' : undefined}
        aria-label={buttonTitle}
        className={cx(classNames['thumb-button__input'], className)}
        data-testid={testIds.feedbackButton}
        name={name}
        onKeyDown={handleKeyDown}
        ref={ref}
        {...(as === 'radio'
          ? {
              checked: pressed,
              onChange: handleClickOrChange,
              type: 'radio'
            }
          : {
              'aria-pressed': pressed,
              onClick: handleClickOrChange,
              type: 'button'
            })}
      />
      <ThumbButtonImage
        className={cx(classNames['thumb-button__image'], classNames['thumb-button__image--is-stroked'])}
        direction={direction}
      />
      <ThumbButtonImage
        className={cx(classNames['thumb-button__image'], classNames['thumb-button__image--is-filled'])}
        direction={direction}
        filled={true}
      />
      <Tooltip className={classNames['thumb-button__tooltip']}>{buttonTitle}</Tooltip>
    </div>
  );
}

export default memo(forwardRef<HTMLInputElement, ThumbButtonProps>(ThumbButton));
export { thumbButtonPropsSchema, type ThumbButtonProps };
