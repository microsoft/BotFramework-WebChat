import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { instance, nullable, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import { useQueueStaticElement } from '../../../providers/LiveRegionTwin';
import refObject from '../../../types/internal/refObject';
import ActivityButton from './ActivityButton';

import styles from './ActivityCopyButton.module.css';

const { useLocalizer, useUIState } = hooks;

const activityCopyButtonPropsSchema = pipe(
  object({
    className: optional(string()),
    targetRef: refObject(nullable(instance(HTMLElement)))
  }),
  readonly()
);

type ActivityCopyButtonProps = InferInput<typeof activityCopyButtonPropsSchema>;

const ActivityCopyButton = (props: ActivityCopyButtonProps) => {
  const { className, targetRef } = validateProps(activityCopyButtonPropsSchema, props);

  const classNames = useStyles(styles);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [uiState] = useUIState();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const localize = useLocalizer();
  const queueStaticElement = useQueueStaticElement();

  const copiedText = localize('COPY_BUTTON_COPIED_TEXT');
  const copyText = localize('COPY_BUTTON_TEXT');
  const disabled = !permissionGranted || uiState === 'disabled';

  useEffect(() => {
    const { current } = buttonRef;

    if (current) {
      const handleAnimationEnd = () =>
        current.classList.remove(...classNames['activity-copy-button--copied'].split(/\s+/gu));

      current.addEventListener('animationend', handleAnimationEnd);

      return () => current.removeEventListener('animationend', handleAnimationEnd);
    }
  }, [buttonRef, classNames]);

  const handleClick = useCallback(() => {
    const htmlText = targetRef.current?.outerHTML;
    const plainText = targetRef.current?.textContent;

    navigator.clipboard
      ?.write([
        new ClipboardItem({
          ...(htmlText ? { 'text/html': new Blob([htmlText], { type: 'text/html' }) } : {}),
          ...(plainText ? { 'text/plain': new Blob([plainText], { type: 'text/plain' }) } : {})
        })
      ])
      .catch(error => console.error(`botframework-webchat-fluent-theme: Failed to copy to clipboard.`, error));

    buttonRef.current?.classList.remove(...classNames['activity-copy-button--copied'].split(/\s+/gu));

    // Reading `offsetWidth` will trigger a reflow and this is critical for resetting the animation.
    // https://css-tricks.com/restart-css-animation/#aa-update-another-javascript-method-to-restart-a-css-animation
    buttonRef.current?.offsetWidth;

    buttonRef.current?.classList.add(...classNames['activity-copy-button--copied'].split(/\s+/gu));

    queueStaticElement(<div className={classNames['activity-copy-button__copy-announcement']}>{copiedText}</div>);
  }, [classNames, copiedText, queueStaticElement, targetRef]);

  useEffect(() => {
    let unmounted = false;

    (async function () {
      if ((await navigator.permissions.query({ name: 'clipboard-write' as any })).state === 'granted') {
        unmounted || setPermissionGranted(true);
      }
    })();

    return () => {
      unmounted = true;
    };
  }, [setPermissionGranted]);

  return (
    <ActivityButton
      className={cx(classNames['activity-copy-button'], className)}
      data-testid="copy button"
      disabled={disabled}
      icon="copy"
      onClick={handleClick}
      ref={buttonRef}
      text={copyText}
    >
      <span className={classNames['activity-copy-button__copied-text']}>{copiedText}</span>
    </ActivityButton>
  );
};

ActivityCopyButton.displayName = 'ActivityCopyButton';

export default memo(ActivityCopyButton);
export { activityCopyButtonPropsSchema, type ActivityCopyButtonProps };
