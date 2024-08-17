import classNames from 'classnames';
import React, { forwardRef, memo, useCallback, type ReactNode } from 'react';
import { useRefFrom } from 'use-ref-from';
import useStyleSet from '../../../hooks/useStyleSet';
import MonochromeImageMasker from '../../../Utils/MonochromeImageMasker';

type Props = Readonly<{
  children?: ReactNode | undefined;
  className?: string | undefined;
  'data-testid'?: string | undefined;
  iconURL?: string | undefined;
  onClick?: (() => void) | undefined;
  text?: string | undefined;
}>;

const ActivityButton = forwardRef<HTMLButtonElement, Props>(
  ({ children, className, 'data-testid': dataTestId, iconURL, onClick, text }, ref) => {
    const [{ activityButton }] = useStyleSet();
    const onClickRef = useRefFrom(onClick);

    const handleClick = useCallback(() => onClickRef.current?.(), [onClickRef]);

    return (
      <button
        className={classNames(activityButton, 'webchat__activity-button', className)}
        data-testid={dataTestId}
        onClick={handleClick}
        ref={ref}
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
