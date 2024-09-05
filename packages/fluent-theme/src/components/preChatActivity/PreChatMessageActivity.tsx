import { hooks } from 'botframework-webchat-component';
import { getOrgSchemaMessage, type WebChatActivity } from 'botframework-webchat-core';
import cx from 'classnames';
import React, { memo, useMemo } from 'react';
import { useStyles } from '../../styles/index.js';
import styles from './PreChatMessageActivity.module.css';
import StarterPromptsToolbar from './StarterPromptsToolbar.js';

type Props = Readonly<{ activity: WebChatActivity & { type: 'message' } }>;

const { useLocalizer, useRenderMarkdownAsHTML, useUIState } = hooks;

const PreChatMessageActivity = ({ activity }: Props) => {
  const [uiState] = useUIState();
  const classNames = useStyles(styles);
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();
  const localize = useLocalizer();

  const entity = getOrgSchemaMessage(activity?.entities || []);
  const author = useMemo(
    () =>
      typeof entity?.author === 'string'
        ? {
            '@type': 'Person',
            description: undefined,
            image: undefined,
            name: entity?.author
          }
        : entity?.author,
    [entity?.author]
  );

  const html = useMemo(
    () => (renderMarkdownAsHTML ? { __html: renderMarkdownAsHTML(author?.description || '') } : { __html: '' }),
    [author?.description, renderMarkdownAsHTML]
  );

  return (
    <div className={classNames['pre-chat-message-activity']}>
      {author && (
        <div
          className={cx(
            classNames['pre-chat-message-activity__body'],
            uiState === 'blueprint' && classNames['pre-chat-message-activity__body--blueprint']
          )}
        >
          {author.image && (
            <img
              alt={localize('AVATAR_ALT', author.name)}
              className={classNames['pre-chat-message-activity__body-avatar']}
              src={author.image}
            />
          )}
          {author.name && <h2 className={classNames['pre-chat-message-activity__body-title']}>{author.name}</h2>}
          {author.description && (
            // eslint-disable-next-line react/no-danger
            <div className={classNames['pre-chat-message-activity__body-subtitle']} dangerouslySetInnerHTML={html} />
          )}
        </div>
      )}
      <StarterPromptsToolbar
        cardActions={activity.suggestedActions?.actions || []}
        className={classNames['pre-chat-message-activity__toolbar']}
      />
    </div>
  );
};

PreChatMessageActivity.displayName = 'PreChatMessageActivity';

export default memo(PreChatMessageActivity);
