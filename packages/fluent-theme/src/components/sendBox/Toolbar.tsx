import cx from 'classnames';
import React, { memo, type MouseEventHandler, type ReactNode } from 'react';
import { useStyles } from '../../styles';
import styles from './Toolbar.module.css';

const preventDefaultHandler: MouseEventHandler<HTMLButtonElement> = event => event.preventDefault();

export const ToolbarButton = memo(
  (
    props: Readonly<{
      'aria-label'?: string | undefined;
      children?: ReactNode | undefined;
      className?: string | undefined;
      'data-testid'?: string | undefined;
      disabled?: boolean | undefined;
      onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
      selected?: boolean | undefined;
      type?: 'button' | 'submit' | undefined;
    }>
  ) => {
    const classNames = useStyles(styles);

    return (
      <button
        aria-label={props['aria-label']}
        className={cx(classNames['sendbox__toolbar-button'], props.className, {
          [classNames['sendbox__toolbar-button--selected']]: props.selected
        })}
        data-testid={props['data-testid']}
        onClick={props.disabled ? preventDefaultHandler : props.onClick}
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

  return <div className={cx(classNames['sendbox__toolbar'], props.className)}>{props.children}</div>;
});

Toolbar.displayName = 'Toolbar';

export const ToolbarSeparator = memo(
  (props: Readonly<{ children?: ReactNode | undefined; className?: string | undefined }>) => {
    const classNames = useStyles(styles);

    return (
      <div
        aria-orientation="vertical"
        className={cx(classNames['sendbox__toolbar-separator'], props.className)}
        role="separator"
      />
    );
  }
);

ToolbarSeparator.displayName = 'ToolbarSeparator';
