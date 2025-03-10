import React, { memo, ReactNode } from 'react';
import classNames from 'classnames';

import { useStyleSet } from '../hooks';

function ChatHistoryBox({ children, className }: Readonly<{ children: ReactNode; className?: string | undefined }>) {
  const [{ chatHistoryBox }] = useStyleSet();
  return <div className={classNames('webchat__chat-history-box', className, chatHistoryBox)}>{children}</div>;
}

export default memo(ChatHistoryBox);
