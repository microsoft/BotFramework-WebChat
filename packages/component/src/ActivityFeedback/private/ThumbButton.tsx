import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { forwardRef, memo, useCallback, useMemo, type ForwardedRef } from 'react';
import { useRefFrom } from 'use-ref-from';

import useStyleSet from '../../hooks/useStyleSet';
import testIds from '../../testIds';
import { Tooltip } from '../../Tooltip';
import ThumbButtonImage from './ThumbButton.Image';

const { useLocalizer } = hooks;

type Props = Readonly<{
  className?: string | undefined;
  direction: 'down' | 'up';
  disabled?: boolean | undefined;
  onClick?: () => void;
  pressed?: boolean;
  title?: string | undefined;
}>;

function ThumbButton(
  { className, direction, disabled, onClick, pressed, title }: Props,
  ref: ForwardedRef<HTMLButtonElement>
) {
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

export default memo(forwardRef<HTMLButtonElement, Props>(ThumbButton));
