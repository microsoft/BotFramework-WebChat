import './Notification.css';

import classNames from 'classnames';
import React from 'react';

const Notification = ({ children, icon }) => {
  return (
    <div className="App-Notification">
      <i className={classNames('App-Notification-Icon', 'ms-Icon', `ms-Icon--${icon}`)} />
      <div className="App-Notification-Text">{children}</div>
    </div>
  );
};

export default Notification;
