import React, { memo, ReactNode } from 'react';
import classNames from 'classnames';

type Props = Readonly<{ className?: string; children?: ReactNode | undefined }>;

const StatusSlot = ({ children, className }: Props) => (
  <div className={classNames('webchat__activity-status-slot', className)}>{children}</div>
);

StatusSlot.displayName = 'StatusSlot';

export default memo(StatusSlot);
