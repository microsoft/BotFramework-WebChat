import { hooks } from 'botframework-webchat-api';
import { validateProps } from 'botframework-webchat-api/internal';
import classNames from 'classnames';
import React, { forwardRef, memo, useCallback, useMemo, type ForwardedRef, type KeyboardEventHandler } from 'react';
import { useRefFrom } from 'use-ref-from';
import { boolean, function_, literal, object, optional, pipe, readonly, string, union, type InferInput } from 'valibot';

import useStyleSet from '../../hooks/useStyleSet';
import testIds from '../../testIds';
import { Tooltip } from '../../Tooltip';
import ThumbButtonImage from './ThumbButton.Image';

const { useLocalizer } = hooks;

const thumbButtonPropsSchema = pipe(
  object({
    className: optional(string()),
    direction: union([literal('down'), literal('up')]),
    disabled: optional(boolean()),
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
  const { className, direction, disabled, onClick, pressed, size, submitted, title } = validateProps(
    thumbButtonPropsSchema,
    props
  );

  const [{ thumbButton }] = useStyleSet();
  const localize = useLocalizer();
  const onClickRef = useRefFrom(onClick);

  const buttonTitle = useMemo(
    () => title ?? localize(direction === 'down' ? 'VOTE_DISLIKE_ALT' : 'VOTE_LIKE_ALT'),
    [direction, localize, title]
  );

  const handleChange = useCallback(() => !disabled && onClickRef.current?.(), [disabled, onClickRef]);

  const handleKeyDown = useCallback<KeyboardEventHandler<HTMLInputElement>>(event => {
    // Do not submit the <form> via ENTER key.
    event.key === 'Enter' && event.preventDefault();
  }, []);

  return (
    <div
      className={classNames(
        'webchat__thumb-button',
        {
          'webchat__thumb-button--large': size === 'large',
          'webchat__thumb-button--has-submitted': submitted
        },
        className,
        thumbButton + ''
      )}
    >
      <input
        aria-disabled={disabled ? 'true' : undefined}
        aria-label={buttonTitle}
        checked={pressed}
        className={classNames(
          'webchat__thumb-button__input',
          { 'webchat__thumb-button__input--is-pressed': pressed },
          className,
          thumbButton + ''
        )}
        data-testid={testIds.feedbackButton}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        ref={ref}
        type="checkbox"
      />
      <ThumbButtonImage
        className={classNames('webchat__thumb-button__image', 'webchat__thumb-button__image--is-stroked', {
          'webchat__thumb-button__image--is-down': direction === 'down'
        })}
        direction={direction}
      />
      <ThumbButtonImage
        className={classNames('webchat__thumb-button__image', 'webchat__thumb-button__image--is-filled', {
          'webchat__thumb-button__image--is-down': direction === 'down'
        })}
        direction={direction}
        filled={true}
      />
      <Tooltip className="webchat__thumb-button__tooltip">{buttonTitle}</Tooltip>
    </div>
  );
}

export default memo(forwardRef<HTMLInputElement, ThumbButtonProps>(ThumbButton));
export { thumbButtonPropsSchema, type ThumbButtonProps };
