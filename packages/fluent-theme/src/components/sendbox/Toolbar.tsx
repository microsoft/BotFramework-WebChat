import cx from 'classnames';
import React, { memo, type MouseEventHandler, type ReactNode } from 'react';
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
      '&:not([aria-disabled="true"]):hover': {
        backgroundColor: 'var(--colorSubtleBackgroundHover)',
        color: 'var(--colorNeutralForeground2BrandHover)'
      }
    },
    '&:not([aria-disabled="true"]):active': {
      backgroundColor: 'var(--colorSubtleBackgroundPressed)',
      color: 'var(--colorNeutralForeground2BrandPressed)'
    },
    '&[aria-disabled="true"]': {
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

export const ToolbarButton = memo(
  (
    props: Readonly<{
      'aria-label'?: string | undefined;
      children?: ReactNode | undefined;
      className?: string | undefined;
      'data-testid'?: string | undefined;
      disabled?: boolean | undefined;
      onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
      type?: 'button' | 'submit' | undefined;
    }>
  ) => {
    const classNames = useStyles(styles);

    return (
      <button
        aria-label={props['aria-label']}
        className={cx(classNames['webchat-fluent__sendbox__toolbar-button'], props.className)}
        data-testid={props['data-testid']}
        onClick={props.onClick}
        type={props.type === 'submit' ? 'submit' : 'button'}
        {...(props.disabled && {
          'aria-disabled': 'true',
          tabIndex: -1
        })}
      >
        {props.children}
      </button>
    );
  }
);

ToolbarButton.displayName = 'ToolbarButton';

export const Toolbar = memo((props: Readonly<{ children?: ReactNode | undefined; className?: string | undefined }>) => {
  const classNames = useStyles(styles);

  return <div className={cx(classNames['webchat-fluent__sendbox__toolbar'], props.className)}>{props.children}</div>;
});

Toolbar.displayName = 'Toolbar';

export const ToolbarSeparator = memo(
  (props: Readonly<{ children?: ReactNode | undefined; className?: string | undefined }>) => {
    const classNames = useStyles(styles);

    return (
      <div
        aria-orientation="vertical"
        className={cx(classNames['webchat-fluent__sendbox__toolbar-separator'], props.className)}
        role="separator"
      />
    );
  }
);

ToolbarSeparator.displayName = 'ToolbarSeparator';
