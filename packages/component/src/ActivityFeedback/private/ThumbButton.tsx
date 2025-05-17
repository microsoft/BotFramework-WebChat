import { hooks } from 'botframework-webchat-api';
import { validateProps } from 'botframework-webchat-api/internal';
import classNames from 'classnames';
import React, { forwardRef, memo, useCallback, useMemo, type ForwardedRef } from 'react';
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
    title: optional(string())
  }),
  readonly()
);

type ThumbButtonProps = InferInput<typeof thumbButtonPropsSchema>;

function ThumbButton(props: ThumbButtonProps, ref: ForwardedRef<HTMLButtonElement>) {
  const { className, direction, disabled, onClick, pressed, title } = validateProps(thumbButtonPropsSchema, props);

  const [{ thumbButton }] = useStyleSet();
  const localize = useLocalizer();
  const onClickRef = useRefFrom(onClick);

  const buttonTitle = useMemo(
    () => title ?? localize(direction === 'down' ? 'VOTE_DISLIKE_ALT' : 'VOTE_LIKE_ALT'),
    [direction, localize, title]
  );

  const handleClick = useCallback(() => !disabled && onClickRef.current?.(), [disabled, onClickRef]);

  return (
    <button
      aria-disabled={disabled ? 'true' : undefined}
      aria-label={buttonTitle}
      aria-pressed={pressed}
      className={classNames(
        'webchat__thumb-button',
        { 'webchat__thumb-button--is-pressed': pressed },
        className,
        thumbButton + ''
      )}
      data-testid={testIds.feedbackButton}
      onClick={handleClick}
      ref={ref}
      type="button"
    >
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
      <Tooltip>{buttonTitle}</Tooltip>
    </button>
  );
}

export default memo(forwardRef<HTMLButtonElement, ThumbButtonProps>(ThumbButton));
export { thumbButtonPropsSchema, type ThumbButtonProps };
