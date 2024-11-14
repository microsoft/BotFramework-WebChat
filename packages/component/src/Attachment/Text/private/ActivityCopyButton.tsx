import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo, useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import useStyleSet from '../../../hooks/useStyleSet';
import ActivityButton from './ActivityButton';

const { useLocalizer, useUIState } = hooks;

type Props = Readonly<{
  className?: string | undefined;
  targetRef?: RefObject<HTMLElement>;
}>;

const COPY_ICON_URL = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none"><path d="M8.5 2C7.39543 2 6.5 2.89543 6.5 4V14C6.5 15.1046 7.39543 16 8.5 16H14.5C15.6046 16 16.5 15.1046 16.5 14V4C16.5 2.89543 15.6046 2 14.5 2H8.5ZM7.5 4C7.5 3.44772 7.94772 3 8.5 3H14.5C15.0523 3 15.5 3.44772 15.5 4V14C15.5 14.5523 15.0523 15 14.5 15H8.5C7.94772 15 7.5 14.5523 7.5 14V4ZM4.5 6.00001C4.5 5.25973 4.9022 4.61339 5.5 4.26758V14.5C5.5 15.8807 6.61929 17 8 17H14.2324C13.8866 17.5978 13.2403 18 12.5 18H8C6.067 18 4.5 16.433 4.5 14.5V6.00001Z" fill="#000000"/></svg>')}`;

const ActivityCopyButton = ({ className, targetRef }: Props) => {
  const [{ activityButton, activityCopyButton }] = useStyleSet();
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [uiState] = useUIState();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const localize = useLocalizer();

  const copiedText = localize('COPY_BUTTON_COPIED_TEXT');
  const copyText = localize('COPY_BUTTON_TEXT');
  const disabled = !permissionGranted || uiState === 'disabled';

  useEffect(() => {
    const { current } = buttonRef;

    if (current) {
      const handleAnimationEnd = () => current.classList.remove('webchat__activity-copy-button--copied');

      current.addEventListener('animationend', handleAnimationEnd);

      return () => current.removeEventListener('animationend', handleAnimationEnd);
    }
  }, [buttonRef]);

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

    buttonRef.current?.classList.remove('webchat__activity-copy-button--copied');

    // Reading `offsetWidth` will trigger a reflow and this is critical for resetting the animation.
    // https://css-tricks.com/restart-css-animation/#aa-update-another-javascript-method-to-restart-a-css-animation
    // eslint-disable-next-line no-unused-expressions
    buttonRef.current?.offsetWidth;

    buttonRef.current?.classList.add('webchat__activity-copy-button--copied');
  }, [buttonRef, targetRef]);

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
      className={classNames(
        activityButton,
        activityCopyButton,
        'webchat__activity-button',
        'webchat__activity-copy-button',
        className
      )}
      data-testid="copy button"
      disabled={disabled}
      iconURL={COPY_ICON_URL}
      onClick={handleClick}
      ref={buttonRef}
      text={copyText}
    >
      <span className="webchat__activity-copy-button__copied-text">{copiedText}</span>
    </ActivityButton>
  );
};

ActivityCopyButton.displayName = 'ActivityCopyButton';

export default memo(ActivityCopyButton);
