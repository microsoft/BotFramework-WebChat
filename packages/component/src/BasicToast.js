/* eslint react/forbid-dom-props: "off" */
/* eslint react/no-danger: "off" */

import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles, webChatPrefixedClassName } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { useCallback, useMemo } from 'react';
import { object, optional, pipe, readonly, string } from 'valibot';

import ScreenReaderText from './ScreenReaderText';
import DismissIcon from './Toast/DismissIcon';
import NotificationIcon from './Toast/NotificationIcon';
import randomId from './Utils/randomId';
import renderMarkdownInline from './private/renderMarkdownInline';

import styles from './Toast/Toast.module.css';

const { useDismissNotification, useLocalizer } = hooks;

const basicToastPropsSchema = pipe(
  object({
    notification: pipe(
      object({
        alt: optional(string()),
        id: string(),
        level: string(),
        // Has a default value.
        message: optional(string())
      }),
      readonly()
    )
  }),
  readonly()
);

const BasicToast = props => {
  const {
    notification: { alt, id, level, message = '' }
  } = validateProps(basicToastPropsSchema, props);

  // Keeps the "webchat__toast" class names.
  const classNames = useStyles(styles, webChatPrefixedClassName);
  const contentId = useMemo(() => `webchat__toast__${randomId()}`, []);
  const localize = useLocalizer();
  const dismissNotification = useDismissNotification();

  const handleDismiss = useCallback(() => dismissNotification(id), [dismissNotification, id]);
  const html = useMemo(() => ({ __html: renderMarkdownInline(message) }), [message]);

  return (
    <div
      aria-describedby={contentId}
      aria-label={localize('TOAST_TITLE_ALT')}
      className={cx(classNames['toast'], {
        [classNames['toast--error']]: level === 'error',
        [classNames['toast--info']]: level === 'info',
        [classNames['toast--success']]: level === 'success',
        [classNames['toast--warn']]: level === 'warn'
      })}
      role="dialog"
    >
      <div className={classNames['toast__iconBox']}>
        <NotificationIcon className="webchat__toast__icon" level={level} />
      </div>
      {!!alt && <ScreenReaderText text={alt} />}
      <div aria-hidden={!!alt} className={classNames['toast__text']} dangerouslySetInnerHTML={html} id={contentId} />
      <button
        aria-label={localize('TOAST_DISMISS_BUTTON')}
        className={classNames['toast__dismissButton']}
        onClick={handleDismiss}
        type="button"
      >
        <div aria-hidden={true} className={classNames['toast__dismissButtonFocus']}>
          <DismissIcon />
        </div>
      </button>
    </div>
  );
};

export default BasicToast;
