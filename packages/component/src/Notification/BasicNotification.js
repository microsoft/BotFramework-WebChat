/* eslint react/no-danger: "off" */

import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

import { useDismissNotification } from '../hooks';
import DismissIcon from './DismissIcon';
import NotificationIcon from './NotificationIcon';
import ScreenReaderText from '../ScreenReaderText';
import useInternalRenderMarkdownInline from '../hooks/internal/useInternalRenderMarkdownInline';
import useStyleSet from '../hooks/useStyleSet';

const ROOT_CSS = css({
  display: 'flex',

  '& .webchat__notification__text': {
    flex: 1
  }
});

const Notification = ({ alt, level, message, notificationId }) => {
  const [{ notification: notificationStyleSet }] = useStyleSet();
  const dismissNotification = useDismissNotification();
  const handleDismissNotification = useCallback(() => dismissNotification(notificationId), [
    dismissNotification,
    notificationId
  ]);
  const renderMarkdownInline = useInternalRenderMarkdownInline();
  const html = useMemo(() => ({ __html: renderMarkdownInline(message) }), [renderMarkdownInline, message]);

  return (
    <div
      className={classNames(ROOT_CSS + '', notificationStyleSet + '', {
        'webchat__notification--error': level === 'error',
        'webchat__notification--info': level === 'info',
        'webchat__notification--success': level === 'success',
        'webchat__notification--warn': level === 'warn'
      })}
    >
      <ScreenReaderText text={alt || message} />
      <div className="webchat__notification__iconBox">
        <NotificationIcon className="webchat__notification__icon" level={level} />
      </div>
      <div className="webchat__notification__text" dangerouslySetInnerHTML={html} />
      <button className="webchat__notification__dismissButton" onClick={handleDismissNotification} type="button">
        <ScreenReaderText text="Dismiss" />
        <DismissIcon />
      </button>
    </div>
  );
};

Notification.defaultProps = {
  alt: undefined
};

Notification.propTypes = {
  alt: PropTypes.string,
  level: PropTypes.oneOf(['error', 'warn', 'info', 'success']).isRequired,
  message: PropTypes.string.isRequired,
  notificationId: PropTypes.string.isRequired
};

export default Notification;
