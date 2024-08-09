import React, { memo, useCallback, useEffect, useState } from 'react';
import { useRefFrom } from 'use-ref-from';
import { useStyles } from '../../styles';
import Button from './Button';
import styles from './CopyButton.module.css';

import { hooks as apiHooks } from 'botframework-webchat-api';
import { hooks as componentHooks } from 'botframework-webchat-component';

const { usePonyfill } = apiHooks;
const { useRenderMarkdownAsHTML } = componentHooks;

type Props = Readonly<{
  activity: {
    text?: string | undefined;
    textFormat?: string | undefined;
    type: string;
  };
}>;

// TODO: Need to localize.
const COPIED_TEXT = 'Copied';
const COPY_TEXT = 'Copy';
// eslint-disable-next-line no-magic-numbers
const SHOW_COPIED_TEXT_DURATION = 1_000;

const CopyButton = (props: Props) => {
  const activityRef = useRefFrom(props.activity);
  const classNames = useStyles(styles);
  const [copied, setCopied] = useState(false);
  const [{ setTimeout }] = usePonyfill();
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();

  const handleClick = useCallback(() => {
    const { current } = activityRef;

    // TODO: See if we should/could/want to copy in rich-text style.
    if (current.type === 'message' && current.text) {
      navigator.clipboard
        .write([
          new ClipboardItem({
            ...(renderMarkdownAsHTML && (!current.textFormat || current.textFormat === 'markdown')
              ? { 'text/html': new Blob([renderMarkdownAsHTML(current.text)], { type: 'text/html' }) }
              : {}),
            'text/plain': new Blob([current.text], { type: 'text/plain' })
          })
        ])
        .catch(error => console.error(`botframework-webchat-fluent-theme: Failed to copy to clipboard.`, error));

      setCopied(true);
    } else {
      console.warn(
        'botframework-webchat-fluent-theme: Cannot copy a non-message activity or a message activity with empty content.'
      );
    }
  }, [activityRef, renderMarkdownAsHTML]);

  useEffect(() => {
    let unmounted = false;

    if (copied) {
      setTimeout(() => unmounted || setCopied(false), SHOW_COPIED_TEXT_DURATION);
    }

    return () => {
      unmounted = true;
    };
  }, [copied, setCopied, setTimeout]);

  return (
    <Button
      className={classNames['activity-toolbox__copy-button']}
      iconURL="data:image/svg+xml;utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2221%22%20height%3D%2220%22%20viewBox%3D%220%200%2021%2020%22%20fill%3D%22none%22%3E%3Cpath%20d%3D%22M8.5%202C7.39543%202%206.5%202.89543%206.5%204V14C6.5%2015.1046%207.39543%2016%208.5%2016H14.5C15.6046%2016%2016.5%2015.1046%2016.5%2014V4C16.5%202.89543%2015.6046%202%2014.5%202H8.5ZM7.5%204C7.5%203.44772%207.94772%203%208.5%203H14.5C15.0523%203%2015.5%203.44772%2015.5%204V14C15.5%2014.5523%2015.0523%2015%2014.5%2015H8.5C7.94772%2015%207.5%2014.5523%207.5%2014V4ZM4.5%206.00001C4.5%205.25973%204.9022%204.61339%205.5%204.26758V14.5C5.5%2015.8807%206.61929%2017%208%2017H14.2324C13.8866%2017.5978%2013.2403%2018%2012.5%2018H8C6.067%2018%204.5%2016.433%204.5%2014.5V6.00001Z%22%20fill%3D%22%23000000%22%2F%3E%3C%2Fsvg%3E"
      onClick={handleClick}
      text={COPY_TEXT}
    >
      {copied && <span className={classNames['activity-toolbox__copy-button__copied-text']}>{COPIED_TEXT}</span>}
    </Button>
  );
};

CopyButton.displayName = 'CopyButton';

export default memo(CopyButton);
