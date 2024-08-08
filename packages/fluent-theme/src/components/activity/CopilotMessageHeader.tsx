import { WebChatActivity, hooks } from 'botframework-webchat-component';
import React, { memo, useMemo } from 'react';
import { useStyles } from '../../styles';
import styles from './CopilotMessageHeader.module.css';

const { useStyleOptions, useLocalizer } = hooks;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function CopilotMessageHeader({ activity }: Readonly<{ activity?: WebChatActivity | undefined }>) {
  const [{ botAvatarImage, botTitle }] = useStyleOptions();
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  // TODO: how we determine the activity has ai-generated content
  const isAIGenerated = useMemo(() => !!activity, [activity]);

  return (
    <div className={classNames['copilot-message-header']}>
      <img
        alt={localize('AVATAR_ALT', botTitle)}
        className={classNames['copilot-message-header__avatar']}
        src={botAvatarImage}
      />
      <span className={classNames['copilot-message-header__title']} title={botTitle}>
        {botTitle}
      </span>
      {isAIGenerated && (
        <span className={classNames['copilot-message-header__ai-generated-content']}>
          {localize('ACTIVITY_CONTENT_CAUTION')}
        </span>
      )}
    </div>
  );
}

export default memo(CopilotMessageHeader);
