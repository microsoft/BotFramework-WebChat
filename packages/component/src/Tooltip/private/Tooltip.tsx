import cx from 'classnames';
import React, { memo, type ReactNode } from 'react';
import { useStyleSet } from '../../hooks';

type TooltipProps = Readonly<{
  children: ReactNode;
  className?: string | undefined;
  position?: 'block-start';
}>;

function Tooltip({ children, className, position = 'block-start' }: TooltipProps) {
  const [{ tooltip: tooltipClassName }] = useStyleSet();

  return (
    <span
      className={cx('webchat__tooltip', className, tooltipClassName, `webchat__tooltip--${position}`)}
      /* @ts-expect-error: inert unknown attribute */
      inert="true"
      role="tooltip"
    >
      {children}
    </span>
  );
}

export default memo(Tooltip);
