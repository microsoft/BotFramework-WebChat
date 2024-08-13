import { WebChatActivity, hooks } from 'botframework-webchat-component';
import React, { memo, useMemo, type CSSProperties } from 'react';
import { useStyles } from '../../styles';
import styles from './CopilotMessageHeader.module.css';

const { useStyleOptions, useLocalizer } = hooks;

function CopilotMessageHeader({ activity }: Readonly<{ activity?: WebChatActivity | undefined }>) {
  const [{ botAvatarImage, botAvatarBackgroundColor }] = useStyleOptions();
  const classNames = useStyles(styles);
  const localize = useLocalizer();
  // TODO: how we determine the activity has ai-generated content
  const isAIGenerated = useMemo(() => !!activity, [activity]);
  const botTitle = activity?.from?.name;

  const avatarStyle = useMemo(
    () => ({ '--background-color': botAvatarBackgroundColor }) as CSSProperties,
    [botAvatarBackgroundColor]
  );

  return (
    <div className={classNames['copilot-message-header']}>
      <img
        alt={localize('AVATAR_ALT', botTitle)}
        className={classNames['copilot-message-header__avatar']}
        src={botAvatarImage}
        style={avatarStyle}
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
