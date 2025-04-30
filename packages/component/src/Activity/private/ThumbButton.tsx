import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo, useCallback, useMemo } from 'react';
import { useRefFrom } from 'use-ref-from';

import ThumbButtonImage from './ThumbButton.Image';
import useStyleSet from '../../hooks/useStyleSet';
import { Tooltip } from '../../Tooltip';

const { useLocalizer } = hooks;

type Props = Readonly<{
  className?: string | undefined;
  direction: 'down' | 'up';
  disabled?: boolean | undefined;
  onClick?: () => void;
  pressed?: boolean;
  title?: string | undefined;
}>;

const ThumbButton = memo(({ className, direction, disabled, onClick, pressed, title }: Props) => {
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
      onClick={handleClick}
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
      <Tooltip className={buttonTitle === title ? 'webchat__tooltip__long--block-start' : undefined}>
        {buttonTitle}
      </Tooltip>
    </button>
  );
});

ThumbButton.displayName = 'ThumbButton';

export default ThumbButton;
