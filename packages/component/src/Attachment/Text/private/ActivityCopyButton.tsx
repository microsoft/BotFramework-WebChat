import { validateProps } from '@msinternal/botframework-webchat-react-valibot';
import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import { hooks } from 'botframework-webchat-api';
import cx from 'classnames';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { instance, nullable, object, optional, pipe, readonly, string, type InferInput } from 'valibot';

import refObject from '../../../types/internal/refObject';
import ActivityButton from './ActivityButton';

import styles from './ActivityCopyButton.module.css';

const { useLocalizer, usePonyfill, useUIState } = hooks;

const COPY_CONFIRMATION_DURATION = 5_000;

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
  const [copyAnnouncementKey, setCopyAnnouncementKey] = useState<number>();
  const [copyStatusPortalTarget, setCopyStatusPortalTarget] = useState<HTMLElement | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [uiState] = useUIState();
  const [{ clearTimeout, setTimeout }] = usePonyfill();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const copyAnnouncementTimeoutIdRef = useRef<ReturnType<typeof setTimeout>>();
  const localize = useLocalizer();

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

  useEffect(() => {
    setCopyStatusPortalTarget(buttonRef.current?.closest<HTMLElement>('.webchat') || null);
  }, [buttonRef, setCopyStatusPortalTarget]);

  useEffect(
    () => () =>
      copyAnnouncementTimeoutIdRef.current && clearTimeout(copyAnnouncementTimeoutIdRef.current),
    [clearTimeout, copyAnnouncementTimeoutIdRef]
  );

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

    setCopyAnnouncementKey(key => (key || 0) + 1);

    copyAnnouncementTimeoutIdRef.current && clearTimeout(copyAnnouncementTimeoutIdRef.current);
    copyAnnouncementTimeoutIdRef.current = setTimeout(() => {
      copyAnnouncementTimeoutIdRef.current = undefined;

      buttonRef.current?.classList.remove(...classNames['activity-copy-button--copied'].split(/\s+/gu));
      setCopyAnnouncementKey(undefined);
    }, COPY_CONFIRMATION_DURATION);
  }, [
    classNames,
    clearTimeout,
    copyAnnouncementTimeoutIdRef,
    setCopyAnnouncementKey,
    setTimeout,
    targetRef
  ]);

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
    <>
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
      {copyStatusPortalTarget &&
        createPortal(
          <div
            aria-atomic={true}
            className={classNames['activity-copy-button__copy-announcement']}
            role="status"
          >
            {!!copyAnnouncementKey && <span key={copyAnnouncementKey}>{copiedText}</span>}
          </div>,
          copyStatusPortalTarget
        )}
    </>
  );
};

ActivityCopyButton.displayName = 'ActivityCopyButton';

export default memo(ActivityCopyButton);
export { activityCopyButtonPropsSchema, type ActivityCopyButtonProps };
