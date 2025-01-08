import './Notification.css';

import classNames from 'classnames';
import React, { memo, type ReactNode } from 'react';

function Notification({ children, icon }: Readonly<{ children?: ReactNode | undefined; icon: string }>) {
  return (
    <div className="App-Notification">
      <i className={classNames('App-Notification-Icon', 'ms-Icon', `ms-Icon--${icon}`)} />
      <div className="App-Notification-Text">{children}</div>
    </div>
  );
}

export default memo(Notification);
