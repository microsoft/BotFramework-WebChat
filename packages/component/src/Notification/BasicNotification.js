import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';

import { useDismissNotification } from '../hooks';
import DismissIcon from './DismissIcon';
import useStyleSet from '../hooks/useStyleSet';
import NotificationIcon from './NotificationIcon';

const ROOT_CSS = css({
  display: 'flex',

  '& > .webchat__notification__name': {
    flex: 1
  },

  '& > button': {
    appearance: 'none'
  }
});

const Notification = ({ alt, level, message, notificationId, persistent }) => {
  const [{ notification: notificationStyleSet }] = useStyleSet();
  const dismissNotification = useDismissNotification();
  const handleDismissNotification = useCallback(() => {
    dismissNotification(notificationId);
  }, [notificationId]);

  return (
    <div
      className={classNames(ROOT_CSS + '', notificationStyleSet + '', {
        'webchat__notification--error': level === 'error',
        'webchat__notification--info': level === 'info',
        'webchat__notification--success': level === 'success',
        'webchat__notification--warn': level === 'warn'
      })}
    >
      <div className="webchat__notification__iconBox">
        <NotificationIcon className="webchat__notification__icon" level={level} />
      </div>
      <div className="webchat__notification__name">{message}</div>
      {!persistent && (
        <button className="webchat__notification__dismissButton" onClick={handleDismissNotification} type="button">
          <DismissIcon />
        </button>
      )}
    </div>
  );
};

Notification.propTypes = {
  alt: PropTypes.string,
  level: PropTypes.oneOf(['error', 'warn', 'info', 'success']).isRequired,
  message: PropTypes.string.isRequired,
  persistent: PropTypes.bool
};

export default Notification;
