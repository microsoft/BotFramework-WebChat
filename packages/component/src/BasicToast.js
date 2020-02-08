/* eslint no-magic-numbers: ["error", { "ignore": [2, 5, 36] }] */
/* eslint react/forbid-dom-props: "off" */
/* eslint react/no-danger: "off" */

import { css } from 'glamor';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import random from 'math-random';
import React, { useCallback, useMemo } from 'react';

import DismissIcon from './Toast/DismissIcon';
import NotificationIcon from './Toast/NotificationIcon';
import ScreenReaderText from './ScreenReaderText';
import useDismissNotification from './hooks/useDismissNotification';
import useInternalRenderMarkdownInline from './hooks/internal/useInternalRenderMarkdownInline';
import useLocalize from './hooks/useLocalize';
import useStyleSet from './hooks/useStyleSet';

const ROOT_CSS = css({
  display: 'flex',

  '& .webchat__toast__text': {
    flex: 1
  }
});

function randomId() {
  return random()
    .toString(36)
    .substr(2, 5);
}

const BasicToast = ({ notification: { alt, id, level, message } }) => {
  const [{ toast: toastStyleSet }] = useStyleSet();
  const contentId = useMemo(() => `webchat__toast__${randomId()}`, []);
  const dismissButtonText = useLocalize('TOAST_DISMISS_BUTTON');
  const dismissNotification = useDismissNotification();
  const toastTitleAlt = useLocalize('TOAST_TITLE_ALT');
  const renderMarkdownInline = useInternalRenderMarkdownInline();

  const handleDismiss = useCallback(() => dismissNotification(id), [dismissNotification, id]);
  const html = useMemo(() => ({ __html: renderMarkdownInline(message) }), [renderMarkdownInline, message]);

  const prefixes = {
    error: useLocalize('TOAST_ERROR_PREFIX'),
    info: useLocalize('TOAST_INFO_PREFIX'),
    success: useLocalize('TOAST_SUCCESS_PREFIX'),
    warn: useLocalize('TOAST_WARN_PREFIX')
  };

  const prefix = prefixes[level] || '$1';
  const prefixedAlt = alt && prefix.replace('$1', alt);

  return (
    <div
      aria-describedby={contentId}
      aria-label={toastTitleAlt}
      className={classNames(ROOT_CSS + '', toastStyleSet + '', {
        'webchat__toast--error': level === 'error',
        'webchat__toast--info': level === 'info',
        'webchat__toast--success': level === 'success',
        'webchat__toast--warn': level === 'warn'
      })}
      role="dialog"
    >
      <div aria-hidden={true} className="webchat__toast__iconBox">
        <NotificationIcon className="webchat__toast__icon" level={level} />
      </div>
      {!!prefixedAlt && <ScreenReaderText text={prefixedAlt} />}
      <div aria-hidden={!!prefixedAlt} className="webchat__toast__text" id={contentId}>
        {!prefixedAlt && <ScreenReaderText text={prefix} />}
        <div dangerouslySetInnerHTML={html} />
      </div>
      <button
        aria-label={dismissButtonText}
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
    level: PropTypes.oneOf(['error', 'warn', 'info', 'success']).isRequired,
    message: PropTypes.string.isRequired
  }).isRequired
};

export default BasicToast;
