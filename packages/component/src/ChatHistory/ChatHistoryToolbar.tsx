import { hooks } from 'botframework-webchat-api';
import classNames from 'classnames';
import React, { memo, ReactNode } from 'react';

const { useDirection } = hooks;

function ChatHistoryToolbar({ children }: Readonly<{ children: ReactNode }>) {
  const [direction] = useDirection();

  return (
    <div
      className={classNames(
        'webchat__chat-history-box__toolbar',
        direction === 'rtl' ? 'webchat__chat-history-box__toolbar--rtl' : ''
      )}
    >
      {children}
    </div>
  );
}

export default memo(ChatHistoryToolbar);
