import { hooks } from 'botframework-webchat';
import { type DirectLineCardAction } from 'botframework-webchat/internal';
import cx from 'classnames';
import React, { memo, useCallback, useMemo } from 'react';
import { useRefFrom } from 'use-ref-from';

import { useStyles } from '../../styles/index.js';
import testIds from '../../testIds.js';
import { FluentIcon } from '../icon';

import styles from './StarterPromptsCardAction.module.css';

const { useFocus, useRenderMarkdownAsHTML, useSendBoxValue, useUIState } = hooks;

type Props = Readonly<{
  className?: string | undefined;
  messageBackAction?: (DirectLineCardAction & { type: 'messageBack' }) | undefined;
}>;

const StarterPromptsCardAction = ({ className, messageBackAction }: Props) => {
  const [_, setSendBoxValue] = useSendBoxValue();
  const [uiState] = useUIState();
  const classNames = useStyles(styles);
  const focus = useFocus();
  const inputTextRef = useRefFrom(messageBackAction?.displayText || messageBackAction?.text || '');
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML('message activity');
  const subtitleHTML = useMemo<{ __html: string } | undefined>(
    () => (renderMarkdownAsHTML ? { __html: renderMarkdownAsHTML(messageBackAction?.text || '') } : undefined),
    [messageBackAction?.text, renderMarkdownAsHTML]
  );
  const disabled = uiState === 'disabled';
  const title = messageBackAction && 'title' in messageBackAction && messageBackAction.title;

  // Every starter prompt card action must have "title" field.
  const shouldShowBlueprint = uiState === 'blueprint' || !title;

  const handleClick = useCallback(() => {
    setSendBoxValue(inputTextRef.current);

    // Focus on the send box after the value is "pasted."
    focus('sendBox');
  }, [focus, inputTextRef, setSendBoxValue]);

  return shouldShowBlueprint ? (
    <div
      className={cx(className, classNames['pre-chat-message-activity__card-action-box'])}
      data-testid={testIds.preChatMessageActivityStarterPromptsCardAction}
    />
  ) : (
    <button
      aria-disabled={disabled ? true : undefined}
      className={cx(className, classNames['pre-chat-message-activity__card-action-box'])}
      data-testid={testIds.preChatMessageActivityStarterPromptsCardAction}
      onClick={disabled ? undefined : handleClick}
      // eslint-disable-next-line no-magic-numbers
      tabIndex={disabled ? -1 : undefined}
      type="button"
    >
      <div className={classNames['pre-chat-message-activity__card-action-title']}>{title}</div>
      {'image' in messageBackAction && messageBackAction.image && (
        <FluentIcon
          appearance="text"
          className={classNames['pre-chat-message-activity__card-action-image']}
          mask={messageBackAction.image}
        />
      )}
      <div
        className={classNames['pre-chat-message-activity__card-action-subtitle']}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={subtitleHTML}
      />
    </button>
  );
};

StarterPromptsCardAction.displayName = 'StarterPromptsCardAction';

export default memo(StarterPromptsCardAction);
