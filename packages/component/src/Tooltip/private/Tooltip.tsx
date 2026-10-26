import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import cx from 'classnames';
import React, { memo, type ReactNode } from 'react';

import styles from './Tooltip.module.css';

type TooltipProps = Readonly<{
  children: ReactNode;
  className?: string | undefined;
  position?: 'block-start';
}>;

function Tooltip({ children, className, position = 'block-start' }: TooltipProps) {
  const classNames = useStyles(styles);

  return (
    <span
      className={cx(classNames['tooltip'], classNames[`tooltip--${position}`], className)}
      /* @ts-expect-error: inert unknown attribute */
      inert="true"
      role="tooltip"
    >
      {children}
    </span>
  );
}

export default memo(Tooltip);
