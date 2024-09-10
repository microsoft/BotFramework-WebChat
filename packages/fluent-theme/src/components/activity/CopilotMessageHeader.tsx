import React, { memo, useMemo, type CSSProperties } from 'react';
import { WebChatActivity, hooks } from 'botframework-webchat-component';

import useActivityStyleOptions from './private/useActivityStyleOptions';
import isAIGeneratedActivity from './private/isAIGeneratedActivity';
import useActivityAuthor from './private/useActivityAuthor';
import { useStyles } from '../../styles';
import styles from './CopilotMessageHeader.module.css';

const { useLocalizer } = hooks;

function CopilotMessageHeader({ activity }: Readonly<{ activity?: WebChatActivity | undefined }>) {
  const [{ botAvatarImage, botAvatarBackgroundColor }] = useActivityStyleOptions(activity);
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  const isAIGenerated = isAIGeneratedActivity(activity);

  const avatarStyle = useMemo(
    () => ({ '--background-color': botAvatarBackgroundColor }) as CSSProperties,
    [botAvatarBackgroundColor]
  );

  const author = useActivityAuthor();
  const avatarImage = author?.image || botAvatarImage;
  const botTitle = author?.name || activity?.from?.name;

  return (
    <div className={classNames['copilot-message-header']}>
      {avatarImage && (
        <img
          alt={localize('AVATAR_ALT', botTitle)}
          className={classNames['copilot-message-header__avatar']}
          src={avatarImage}
          style={avatarStyle}
        />
      )}
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
