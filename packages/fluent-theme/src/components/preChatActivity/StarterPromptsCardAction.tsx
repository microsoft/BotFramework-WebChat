import { Components, hooks } from 'botframework-webchat-component';
import { type DirectLineCardAction } from 'botframework-webchat-core';
import cx from 'classnames';
import React, { memo, useCallback, useMemo } from 'react';
import { useRefFrom } from 'use-ref-from';
import { useStyles } from '../../styles/index.js';
import testIds from '../../testIds.js';
import styles from './StarterPromptsCardAction.module.css';

const { useFocus, useRenderMarkdownAsHTML, useSendBoxValue } = hooks;
const { MonochromeImageMasker } = Components;

type Props = Readonly<{
  className?: string | undefined;
  messageBackAction: DirectLineCardAction & { type: 'messageBack' };
}>;

const StarterPromptAction = ({ className, messageBackAction }: Props) => {
  const [_, setSendBoxValue] = useSendBoxValue();
  const classNames = useStyles(styles);
  const focus = useFocus();
  const inputTextRef = useRefFrom(messageBackAction.displayText || messageBackAction.text || '');
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML('message activity');
  const subtitleHTML = useMemo(
    () => (renderMarkdownAsHTML ? { __html: renderMarkdownAsHTML(messageBackAction.text || '') } : { __html: '' }),
    [messageBackAction.text, renderMarkdownAsHTML]
  );

  const handleClick = useCallback(() => {
    setSendBoxValue(inputTextRef.current);

    // Focus on the send box after the value is "pasted."
    focus('sendBox');
  }, [focus, inputTextRef, setSendBoxValue]);

  return (
    <button
      className={cx(className, classNames['pre-chat-message-activity__card-action-box'], {
        [classNames['pre-chat-message-activity__card-action-box--without-image']]: !('image' in messageBackAction)
      })}
      data-testid={testIds.preChatMessageActivityStarterPromptsCardAction}
      onClick={handleClick}
      type="button"
    >
      <div className={classNames['pre-chat-message-activity__card-action-title']}>
        {'title' in messageBackAction && messageBackAction.title}
      </div>
      {'image' in messageBackAction && messageBackAction.image && (
        <MonochromeImageMasker
          className={classNames['pre-chat-message-activity__card-action-image']}
          src={messageBackAction.image}
        />
        // <img className="pre-chat-message-activity__card-action-image" src={messageBackAction.image} />
      )}
      <div
        className={classNames['pre-chat-message-activity__card-action-subtitle']}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={subtitleHTML}
      />
    </button>
  );
};

StarterPromptAction.displayName = 'StarterPromptAction';

export default memo(StarterPromptAction);
