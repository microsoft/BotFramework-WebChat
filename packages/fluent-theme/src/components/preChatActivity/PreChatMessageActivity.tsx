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

const { useRenderMarkdownAsHTML } = hooks;

const PreChatMessageActivity = ({ activity }: Props) => {
  const classNames = useStyles(styles);
  const renderMarkdownAsHTML = useRenderMarkdownAsHTML();

  const html = useMemo(
    () => (renderMarkdownAsHTML ? { __html: renderMarkdownAsHTML(activity.text || '') } : { __html: '' }),
    [activity.text, renderMarkdownAsHTML]
  );

  const entity = getOrgSchemaMessage(activity?.entities || []);
  const isPlaceHolder = entity?.keywords?.includes('PreChatMessage') && entity.creativeWorkStatus === 'Placeholder';

  return (
    <div className={classNames['pre-chat-message-activity']}>
      <div
        className={cx(
          classNames['pre-chat-message-activity__body'],
          isPlaceHolder && classNames['pre-chat-message-activity__body--placeholder']
        )}
        dangerouslySetInnerHTML={html}
      />
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
