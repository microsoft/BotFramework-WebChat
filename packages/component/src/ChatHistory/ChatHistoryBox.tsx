import React, { memo, ReactNode } from 'react';
import classNames from 'classnames';

import { useStyleSet } from '../hooks';

function ChatHistoryBox({ children }: Readonly<{ children: ReactNode }>) {
  const [{ chatHistoryBox }] = useStyleSet();
  return <div className={classNames('webchat__chat-history-box', chatHistoryBox)}>{children}</div>;
}

export default memo(ChatHistoryBox);
