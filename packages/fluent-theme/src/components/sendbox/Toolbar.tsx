import React, { type ButtonHTMLAttributes, type HTMLAttributes } from 'react';
import cx from 'classnames';
import { useStyles } from '../../styles';

const styles = {
  webchat__sendbox__toolbar: {
    display: 'flex',
    gap: '4px',
    marginInlineStart: 'auto'
  },

  'webchat__sendbox__toolbar-button': {
    display: 'flex',
    appearance: 'none',
    background: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    padding: '3px',
    width: '32px',
    aspectRatio: '1',
    borderRadius: 'var(--borderRadiusSmall)',

    '> svg': {
      width: '20px',
      height: '20px',
      pointerEvents: 'none'
    },

    '@media (hover: hover)': {
      '&:not(:disabled):hover': {
        color: 'var(--colorNeutralForeground2BrandHover)',
        backgroundColor: 'var(--colorSubtleBackgroundHover)'
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

  'webchat__sendbox__toolbar-separator': {
    borderRight: '1px solid var(--colorNeutralStroke2)',
    height: '28px',
    alignSelf: 'center',

    '&:first-child, &:last-child, &:only-child': {
      display: 'none'
    }
  }
};

export function ToolbarButton(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  const classNames = useStyles(styles);
  return (
    <button type="button" {...props} className={cx(classNames['webchat__sendbox__toolbar-button'], props.className)} />
  );
}

export function Toolbar(props: HTMLAttributes<HTMLDivElement>) {
  const classNames = useStyles(styles);
  return <div {...props} className={cx(classNames.webchat__sendbox__toolbar, props.className)} />;
}

export function ToolbarSeparator(props: HTMLAttributes<HTMLDivElement>) {
  const classNames = useStyles(styles);
  return (
    <div
      aria-orientation="vertical"
      role="separator"
      {...props}
      className={cx(classNames['webchat__sendbox__toolbar-separator'], props.className)}
    />
  );
}
