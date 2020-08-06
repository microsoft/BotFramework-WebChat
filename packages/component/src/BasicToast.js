/* eslint react/forbid-dom-props: "off" */
/* eslint react/no-danger: "off" */

import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useCallback, useMemo } from 'react';

import DismissIcon from './Toast/DismissIcon';
import NotificationIcon from './Toast/NotificationIcon';
import randomId from './Utils/randomId';
import ScreenReaderText from './ScreenReaderText';
import useDismissNotification from './hooks/useDismissNotification';
import useInternalRenderMarkdownInline from './hooks/internal/useInternalRenderMarkdownInline';
import useLocalizer from './hooks/useLocalizer';
import useStyleSet from './hooks/useStyleSet';

const ROOT_CSS = css({
  display: 'flex',

  '& .webchat__toast__text': {
    flex: 1
  }
});

const BasicToast = ({ notification: { alt, id, level, message = '' } }) => {
  const [{ toast: toastStyleSet }] = useStyleSet();
  const contentId = useMemo(() => `webchat__toast__${randomId()}`, []);
  const localize = useLocalizer();
  const dismissNotification = useDismissNotification();
  const renderMarkdownInline = useInternalRenderMarkdownInline();

  const handleDismiss = useCallback(() => dismissNotification(id), [dismissNotification, id]);
  const html = useMemo(() => ({ __html: renderMarkdownInline(message) }), [message, renderMarkdownInline]);

  return (
    <div
      aria-describedby={contentId}
      aria-label={localize('TOAST_TITLE_ALT')}
      className={classNames(ROOT_CSS + '', toastStyleSet + '', {
        'webchat__toast--error': level === 'error',
        'webchat__toast--info': level === 'info',
        'webchat__toast--success': level === 'success',
        'webchat__toast--warn': level === 'warn'
      })}
      role="dialog"
    >
      <div className="webchat__toast__iconBox">
        <NotificationIcon className="webchat__toast__icon" level={level} />
      </div>
      {!!alt && <ScreenReaderText text={alt} />}
      <div aria-hidden={!!alt} className="webchat__toast__text" dangerouslySetInnerHTML={html} id={contentId} />
      <button
        aria-label={localize('TOAST_DISMISS_BUTTON')}
        className="webchat__toast__dismissButton"
        onClick={handleDismiss}
        type="button"
      >
        <div aria-hidden={true} className="webchat__toast__dismissButtonFocus">
          <DismissIcon />
        </div>
      </button>
    </div>
  );
};

BasicToast.propTypes = {
  notification: PropTypes.shape({
    alt: PropTypes.string,
    id: PropTypes.string.isRequired,
    level: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired
  }).isRequired
};

export default BasicToast;
