import React, { type ReactNode, type MouseEventHandler } from 'react';
import cx from 'classnames';
import { useStyles } from '../../styles';

const styles = {
  'webchat-fluent__sendbox__toolbar': {
    display: 'flex',
    gap: '4px',
    marginInlineStart: 'auto'
  },

  'webchat-fluent__sendbox__toolbar-button': {
    alignItems: 'center',
    appearance: 'none',
    aspectRatio: '1',
    background: 'transparent',
    border: 'none',
    borderRadius: 'var(--borderRadiusSmall)',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    padding: '3px',
    width: '32px',

    '> svg': {
      fontSize: '20px',
      pointerEvents: 'none'
    },

    '@media (hover: hover)': {
      '&:not(:disabled):hover': {
        backgroundColor: 'var(--colorSubtleBackgroundHover)',
        color: 'var(--colorNeutralForeground2BrandHover)'
      }
    },
    '&:not(:disabled):active': {
      backgroundColor: 'var(--colorSubtleBackgroundPressed)',
      color: 'var(--colorNeutralForeground2BrandPressed)'
    },
    '&:disabled': {
      color: ' var(--colorNeutralForegroundDisabled)',
      cursor: 'not-allowed'
    }
  },

  'webchat-fluent__sendbox__toolbar-separator': {
    alignSelf: 'center',
    borderRight: '1px solid var(--colorNeutralStroke2)',
    height: '28px',

    '&:first-child, &:last-child, &:only-child': {
      display: 'none'
    }
  }
};

export function ToolbarButton(
  props: Readonly<{
    readonly children?: ReactNode | undefined;
    readonly className?: string | undefined;
    readonly disabled?: boolean | undefined;
    readonly onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  }>
) {
  const classNames = useStyles(styles);
  return (
    <button
      className={cx(classNames['webchat-fluent__sendbox__toolbar-button'], props.className)}
      onClick={props.onClick}
      type="button"
    >
      {props.children}
    </button>
  );
}

export function Toolbar(
  props: Readonly<{ readonly children?: ReactNode | undefined; readonly className?: string | undefined }>
) {
  const classNames = useStyles(styles);
  return <div className={cx(classNames['webchat-fluent__sendbox__toolbar'], props.className)}>{props.children}</div>;
}

export function ToolbarSeparator(
  props: Readonly<{ readonly children?: ReactNode | undefined; readonly className?: string | undefined }>
) {
  const classNames = useStyles(styles);
  return (
    <div
      aria-orientation="vertical"
      className={cx(classNames['webchat-fluent__sendbox__toolbar-separator'], props.className)}
      role="separator"
    />
  );
}
