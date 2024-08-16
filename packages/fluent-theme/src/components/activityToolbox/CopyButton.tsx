import { hooks as apiHooks } from 'botframework-webchat-api';
import { hooks as componentHooks } from 'botframework-webchat-component';
import React, { memo, useCallback, useRef } from 'react';
import { useRefFrom } from 'use-ref-from';
import { useStyles } from '../../styles';
import testIds from '../../testIds';
import Button from './Button';
import styles from './CopyButton.module.css';

const { useLocalizer } = apiHooks;
const { useRenderMarkdownAsHTML } = componentHooks;

type Props = Readonly<{
  activity: {
    text?: string | undefined;
    textFormat?: string | undefined;
    type: string;
  };
}>;

const COPY_ICON_URL = `data:image/svg+xml;utf8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20" fill="none"><path d="M8.5 2C7.39543 2 6.5 2.89543 6.5 4V14C6.5 15.1046 7.39543 16 8.5 16H14.5C15.6046 16 16.5 15.1046 16.5 14V4C16.5 2.89543 15.6046 2 14.5 2H8.5ZM7.5 4C7.5 3.44772 7.94772 3 8.5 3H14.5C15.0523 3 15.5 3.44772 15.5 4V14C15.5 14.5523 15.0523 15 14.5 15H8.5C7.94772 15 7.5 14.5523 7.5 14V4ZM4.5 6.00001C4.5 5.25973 4.9022 4.61339 5.5 4.26758V14.5C5.5 15.8807 6.61929 17 8 17H14.2324C13.8866 17.5978 13.2403 18 12.5 18H8C6.067 18 4.5 16.433 4.5 14.5V6.00001Z" fill="#000000"/></svg>')}`;

const CopyButton = (props: Props) => {
  const activityRef = useRefFrom(props.activity);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const classNames = useStyles(styles);
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();
  const localize = useLocalizer();

  const copiedText = localize('COPY_BUTTON_COPIED_TEXT');
  const copyText = localize('COPY_BUTTON_TEXT');

  const handleClick = useCallback(() => {
    const { current } = activityRef;

    if (current.type === 'message' && current.text) {
      navigator.clipboard
        ?.write([
          new ClipboardItem({
            ...(renderMarkdownAsHTML && (!current.textFormat || current.textFormat === 'markdown')
              ? { 'text/html': new Blob([renderMarkdownAsHTML(current.text)], { type: 'text/html' }) }
              : {}),
            'text/plain': new Blob([current.text], { type: 'text/plain' })
          })
        ])
        .catch(error => console.error(`botframework-webchat-fluent-theme: Failed to copy to clipboard.`, error));

      buttonRef.current?.classList.remove(...classNames['activity-toolbox__copy-button--copied'].split(' '));

      // Reading `offsetWidth` will trigger a reflow and this is critical for resetting the animation.
      // https://css-tricks.com/restart-css-animation/#aa-update-another-javascript-method-to-restart-a-css-animation
      // eslint-disable-next-line no-unused-expressions
      buttonRef.current?.offsetWidth;

      buttonRef.current?.classList.add(...classNames['activity-toolbox__copy-button--copied'].split(' '));
    } else {
      console.warn(
        'botframework-webchat-fluent-theme: Cannot copy a non-message activity or a message activity with empty content.'
      );
    }
  }, [activityRef, buttonRef, classNames, renderMarkdownAsHTML]);

  return (
    <Button
      className={classNames['activity-toolbox__copy-button']}
      data-testid={testIds.copyButton}
      iconURL={COPY_ICON_URL}
      onClick={handleClick}
      ref={buttonRef}
      text={copyText}
    >
      <span className={classNames['activity-toolbox__copy-button__copied-text']}>{copiedText}</span>
    </Button>
  );
};

CopyButton.displayName = 'CopyButton';

export default memo(CopyButton);
