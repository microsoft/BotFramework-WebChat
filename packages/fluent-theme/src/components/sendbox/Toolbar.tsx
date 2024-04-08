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

  'webchat__sendbox__toolbar-separator': {
    alignSelf: 'center',
    borderRight: '1px solid var(--colorNeutralStroke2)',
    height: '28px',

    '&:first-child, &:last-child, &:only-child': {
      display: 'none'
    }
  }
};

export function ToolbarButton(props: Readonly<ButtonHTMLAttributes<HTMLButtonElement>>) {
  const classNames = useStyles(styles);
  return (
    <button type="button" {...props} className={cx(classNames['webchat__sendbox__toolbar-button'], props.className)} />
  );
}

export function Toolbar(props: Readonly<HTMLAttributes<HTMLDivElement>>) {
  const classNames = useStyles(styles);
  return <div {...props} className={cx(classNames.webchat__sendbox__toolbar, props.className)} />;
}

export function ToolbarSeparator(props: Readonly<HTMLAttributes<HTMLDivElement>>) {
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
