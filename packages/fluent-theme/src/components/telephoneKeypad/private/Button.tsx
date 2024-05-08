import React, { forwardRef, memo, useCallback, type Ref } from 'react';

import { useRefFrom } from 'use-ref-from';

import { type DTMF } from '../types';

import styles from './Button.module.css';
import { useStyles } from '../../../styles';

type Props = Readonly<{
  button: DTMF;
  ['data-testid']?: string | undefined;
  onClick?: (() => void) | undefined;
  ruby?: string | undefined;
}>;

const Button = memo(
  forwardRef(({ button, 'data-testid': dataTestId, onClick, ruby }: Props, ref: Ref<HTMLButtonElement>) => {
    const classNames = useStyles(styles);
    const onClickRef = useRefFrom(onClick);

    const handleClick = useCallback(() => onClickRef.current?.(), [onClickRef]);

    return (
      <button
        className={classNames['telephone-keypad__button']}
        data-testid={dataTestId}
        onClick={handleClick}
        ref={ref}
        type="button"
      >
        <span className={classNames['telephone-keypad__button__text']}>
          {button === 'star' ? '\u2217' : button === 'pound' ? '#' : button}
        </span>
        {!!ruby && <ruby className={classNames['telephone-keypad__button__ruby']}>{ruby}</ruby>}
      </button>
    );
  })
);

Button.displayName = 'TelephoneKeypad.Button';

export default Button;
