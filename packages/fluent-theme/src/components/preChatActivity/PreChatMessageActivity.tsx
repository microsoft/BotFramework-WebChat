/* eslint-disable react/no-danger */
import { hooks } from 'botframework-webchat-component';
import cx from 'classnames';
import { getOrgSchemaMessage, type WebChatActivity } from 'botframework-webchat-core';
import React, { Fragment, memo, useMemo } from 'react';
import { useStyles } from '../../styles/index.js';
import styles from './PreChatMessageActivity.module.css';
import StarterPromptsToolbar from './StarterPromptsToolbar.js';
import StarterPromptsCardAction from './StarterPromptsCardAction.js';

type Props = Readonly<{ activity: WebChatActivity & { type: 'message' } }>;

const { useLocalizer, useRenderMarkdownAsHTML } = hooks;

const PreChatMessageActivity = ({ activity }: Props) => {
  const classNames = useStyles(styles);
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();
  const localize = useLocalizer();

  const entity = getOrgSchemaMessage(activity?.entities || []);
  const isPlaceHolder = entity?.keywords?.includes('PreChatMessage') && entity.creativeWorkStatus === 'Placeholder';
  const author = typeof entity?.author !== 'string' ? entity?.author : undefined;

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
            isPlaceHolder && classNames['pre-chat-message-activity__body--placeholder']
          )}
        >
          <img
            alt={localize('AVATAR_ALT', author.name)}
            className={classNames['pre-chat-message-activity__body-avatar']}
            src={author.image}
          />
          <h2 className={classNames['pre-chat-message-activity__body-title']}>{author.name}</h2>
          <div className={classNames['pre-chat-message-activity__body-subtitle']} dangerouslySetInnerHTML={html} />
        </div>
      )}
      <StarterPromptsToolbar
        cardActions={activity.suggestedActions?.actions || []}
        className={classNames['pre-chat-message-activity__toolbar']}
      >
        {isPlaceHolder && (
          <Fragment>
            <StarterPromptsCardAction />
            <StarterPromptsCardAction />
            <StarterPromptsCardAction />
          </Fragment>
        )}
      </StarterPromptsToolbar>
    </div>
  );
};

PreChatMessageActivity.displayName = 'PreChatMessageActivity';

export default memo(PreChatMessageActivity);
