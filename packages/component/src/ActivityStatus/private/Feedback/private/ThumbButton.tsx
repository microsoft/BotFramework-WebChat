import React, { memo } from 'react';
import classNames from 'classnames';

import ThumbButtonImage from './ThumbButton.Image';
import useStyleSet from '../../../../hooks/useStyleSet';

type Props = {
  direction: 'down' | 'up';
  // "defaultProps" is being deprecated.
  // eslint-disable-next-line react/require-default-props
  onClick?: () => void;
  // "defaultProps" is being deprecated.
  // eslint-disable-next-line react/require-default-props
  pressed?: boolean;
  // "defaultProps" is being deprecated.
  // eslint-disable-next-line react/require-default-props
  title?: string;
};

const ThumbButton = memo(({ direction, onClick, pressed, title }: Props) => {
  const [{ thumbButton }] = useStyleSet();

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
        className={classNames('webchat__thumb-button__image webchat__thumb-button__image--is-down')}
        direction={direction}
      />
      <ThumbButtonImage
        className={classNames(
          'webchat__thumb-button__image webchat__thumb-button__image--is-down webchat__thumb-button__image--is-filled'
        )}
        direction={direction}
        filled={true}
      />
    </button>
  );
});

ThumbButton.displayName = 'ThumbButton';

export default ThumbButton;
