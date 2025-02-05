import classNames from 'classnames';
import React, { forwardRef, memo, useCallback, type ReactNode } from 'react';
import { useRefFrom } from 'use-ref-from';
import useStyleSet from '../../hooks/useStyleSet';
import MonochromeImageMasker from '../../Utils/MonochromeImageMasker';

type Props = Readonly<{
  children?: ReactNode | undefined;
  className?: string | undefined;
  'data-testid'?: string | undefined;
  disabled?: boolean | undefined;
  iconURL?: string | undefined;
  onClick?: (() => void) | undefined;
  text?: string | undefined;
}>;

const ActivityButton = forwardRef<HTMLButtonElement, Props>(
  ({ children, className, 'data-testid': dataTestId, disabled, iconURL, onClick, text }, ref) => {
    const [{ activityButton }] = useStyleSet();
    const onClickRef = useRefFrom(onClick);

    const handleClick = useCallback(() => onClickRef.current?.(), [onClickRef]);

    return (
      <button
        aria-disabled={disabled ? 'true' : undefined}
        className={classNames(activityButton, 'webchat__activity-button', className)}
        data-testid={dataTestId}
        onClick={disabled ? undefined : handleClick}
        ref={ref}
        // eslint-disable-next-line no-magic-numbers
        tabIndex={disabled ? -1 : undefined}
        type="button"
      >
        {iconURL && <MonochromeImageMasker className="webchat__activity-button__icon" src={iconURL} />}
        {text && <span className="webchat__activity-button__text">{text}</span>}
        {children}
      </button>
    );
  }
);

export default memo(ActivityButton);
