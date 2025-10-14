import { useStyles } from '@msinternal/botframework-webchat-styles/react';
import React, { memo } from 'react';

import styles from './ChatLauncherButton.module.css';

function ChatLauncherButton() {
  const classNames = useStyles(styles);

  return (
    <button className={classNames['chat-launcher-button']} type="button">
      {'💬'}
    </button>
  );
}

ChatLauncherButton.displayName = 'ChatLauncherButton';

export default memo(ChatLauncherButton);
