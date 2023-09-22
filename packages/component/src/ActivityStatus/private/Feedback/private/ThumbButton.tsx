import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo } from 'react';

import ThumbButtonImage from './ThumbButton.Image';
import useStyleSet from '../../../../hooks/useStyleSet';

const { useLocalizer } = hooks;

type Props = Readonly<{
  direction: 'down' | 'up';
  onClick?: () => void;
  pressed?: boolean;
}>;

const ThumbButton = memo(({ direction, onClick, pressed }: Props) => {
  const [{ thumbButton }] = useStyleSet();
  const localize = useLocalizer();

  const title = localize(direction === 'down' ? 'VOTE_DISLIKE_ALT' : 'VOTE_LIKE_ALT');

  return (
    <button
      aria-label={title}
      aria-pressed={pressed}
      className={classNames(
        'webchat__thumb-button',
        { 'webchat__thumb-button--is-pressed': pressed },
        thumbButton + ''
      )}
      onClick={onClick}
      title={title}
      type="button"
    >
      <ThumbButtonImage
        className={classNames('webchat__thumb-button__image', {
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
    </button>
  );
});

ThumbButton.displayName = 'ThumbButton';

export default ThumbButton;
