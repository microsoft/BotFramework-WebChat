import { hooks } from 'botframework-webchat-component';
import { type WebChatActivity } from 'botframework-webchat-core';
import React, { memo, useMemo } from 'react';
import { useStyles } from '../../styles/index.js';
import styles from './PreChatMessageActivity.module.css';
import StarterPromptsToolbar from './StarterPromptsToolbar.js';

type Props = Readonly<{ activity: WebChatActivity & { type: 'message' } }>;

const { useRenderMarkdownAsHTML } = hooks;

const PreChatMessageActivity = ({ activity }: Props) => {
  const classNames = useStyles(styles);
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();

  const html = useMemo(
    () => (renderMarkdownAsHTML ? { __html: renderMarkdownAsHTML(activity.text || '') } : { __html: '' }),
    [activity.text, renderMarkdownAsHTML]
  );

  return (
    <div className={classNames['pre-chat-message-activity']}>
      {/* eslint-disable-next-line react/no-danger */}
      <div className={classNames['pre-chat-message-activity__body']} dangerouslySetInnerHTML={html} />
      <StarterPromptsToolbar
        cardActions={activity.suggestedActions?.actions || []}
        className={classNames['pre-chat-message-activity__toolbar']}
      />
    </div>
  );
};

PreChatMessageActivity.displayName = 'PreChatMessageActivity';

export default memo(PreChatMessageActivity);
