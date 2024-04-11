import React, { forwardRef, memo, useCallback, type Ref } from 'react';

import { useRefFrom } from 'use-ref-from';

import { useStyles } from '../../../styles';
import { type DTMF } from '../types';

const styles = {
  'webchat__telephone-keypad__button': {
    '-webkit-user-select': 'none',
    alignItems: 'center',
    appearance: 'none',
    // backgroundColor: isDarkTheme() || isHighContrastTheme() ? black : white,
    backgroundColor: 'White',
    borderRadius: '100%',

    // Whitelabel styles
    // border: `solid 1px ${isHighContrastTheme() ? white : isDarkTheme() ? gray160 : gray40}`,
    // color: 'inherit',

    border: 'solid 1px var(--webchat-colorNeutralStroke1)',
    color: 'var(--webchat-colorNeutralForeground1)',
    fontWeight: 'var(--webchat-fontWeightSemibold)',

    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    height: 60,
    opacity: 0.7,
    padding: 0,
    position: 'relative',
    touchAction: 'none',
    userSelect: 'none',
    width: 60,

    '&:hover': {
      // backgroundColor: isHighContrastTheme() ? gray210 : isDarkTheme() ? gray150 : gray30
      backgroundColor: 'var(--webchat-colorGray30)'
    }
  },

  'webchat__telephone-keypad__button__ruby': {
    // color: isHighContrastTheme() ? white : isDarkTheme() ? gray40 : gray160,
    color: 'var(--webchat-colorGray160)',
    fontSize: 10
  },

  'webchat__telephone-keypad__button__text': {
    fontSize: 24,
    marginTop: 8
  },

  'webchat__telephone-keypad--horizontal': {
    '& .webchat__telephone-keypad__button': {
      height: 32,
      width: 32,
      margin: '8px 4px',
      justifyContent: 'center'
    },

    'webchat__telephone-keypad__button__ruby': {
      display: 'none'
    },

    '& .webchat__telephone-keypad__button__text': {
      fontSize: 20,
      marginTop: 0
    }
  }
};

type Props = Readonly<{
  button: DTMF;
  ['data-testid']?: string | undefined;
  onClick?: (() => void) | undefined;
  ruby?: string | undefined;
}>;

const Button = memo(
  // As we are all TypeScript, internal components do not need propTypes.
  // eslint-disable-next-line react/prop-types
  forwardRef(({ button, 'data-testid': dataTestId, onClick, ruby }: Props, ref: Ref<HTMLButtonElement>) => {
    const classNames = useStyles(styles);
    const onClickRef = useRefFrom(onClick);

    const handleClick = useCallback(() => onClickRef.current?.(), [onClickRef]);

    return (
      <button
        className={classNames['webchat__telephone-keypad__button']}
        data-testid={dataTestId}
        onClick={handleClick}
        ref={ref}
        type="button"
      >
        <span className={classNames['webchat__telephone-keypad__button__text']}>
          {button === 'star' ? '\u2217' : button === 'pound' ? '#' : button}
        </span>
        {!!ruby && <ruby className={classNames['webchat__telephone-keypad__button__ruby']}>{ruby}</ruby>}
      </button>
    );
  })
);

Button.displayName = 'TelephoneKeypad.Button';

export default Button;
