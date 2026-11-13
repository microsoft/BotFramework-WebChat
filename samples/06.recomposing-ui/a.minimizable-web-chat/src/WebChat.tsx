import ReactWebChat, { createDirectLine, type createStore } from 'botframework-webchat';
import React, { memo, useEffect, useMemo } from 'react';

import './WebChat.css';

type Props = Readonly<{
  className?: string | undefined;
  onFetchToken?: (() => void) | undefined;
  store: ReturnType<typeof createStore>;
  token: string;
}>;

function WebChat({ className, onFetchToken, store, token }: Props) {
  const directLine = useMemo(() => createDirectLine({ token }), [token]);

  useEffect(() => {
    onFetchToken?.();
  }, [onFetchToken]);

  return token ? (
    <ReactWebChat
      className={`${className || ''} web-chat`}
      directLine={directLine}
      store={store}
      styleOptions={{
        backgroundColor: 'Transparent'
      }}
    />
  ) : (
    <div className={`${className || ''} connect-spinner`}>
      <div className="content">
        <div className="icon">
          <span className="ms-Icon ms-Icon--Robot" />
        </div>
        <p>{'Please wait while we are connecting.'}</p>
      </div>
    </div>
  );
}

export default memo(WebChat);
