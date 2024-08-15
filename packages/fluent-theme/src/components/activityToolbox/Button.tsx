import cx from 'classnames';
import React, { forwardRef, memo, useCallback, type ReactNode } from 'react';
import { useRefFrom } from 'use-ref-from';
import { useStyles } from '../../styles';
import MonochromeImageMasker from '../preChatActivity/private/MonochromeImageMasker';
import styles from './Button.module.css';

type Props = Readonly<{
  children?: ReactNode | undefined;
  className?: string | undefined;
  'data-testid'?: string | undefined;
  iconURL?: string | undefined;
  onClick: () => void;
  text?: string | undefined;
}>;

const Button = forwardRef<HTMLButtonElement, Props>((props, ref) => {
  const classNames = useStyles(styles);
  const onClickRef = useRefFrom(props.onClick);

  const handleClick = useCallback(() => onClickRef.current?.(), [onClickRef]);

  return (
    <button
      className={cx(props.className, classNames['activity-toolbox__base-button'])}
      data-testid={props['data-testid']}
      onClick={handleClick}
      ref={ref}
      type="button"
    >
      {props.iconURL && (
        <MonochromeImageMasker className={classNames['activity-toolbox__base-button-icon']} src={props.iconURL} />
      )}
      {props.text && <span className={classNames['activity-toolbox__base-button-text']}>{props.text}</span>}
      {props.children}
    </button>
  );
});

export default memo(Button);
