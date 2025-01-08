import ReactWebChat, { createDirectLine, type createStore } from 'botframework-webchat';
import React, { memo, useEffect, useMemo } from 'react';

import './WebChat.css';

type Props = Readonly<{
  className?: string | undefined;
  onFetchToken?: (() => void) | undefined;
  store: ReturnType<typeof createStore>;
  styleSet: any;
  token: string;
}>;

function WebChat({ className, onFetchToken, store, styleSet, token }: Props) {
  const directLine = useMemo(() => createDirectLine({ token }), [token]);

  useEffect(() => {
    onFetchToken?.();
  }, [onFetchToken]);

  return token ? (
    <ReactWebChat className={`${className || ''} web-chat`} directLine={directLine} store={store} styleSet={styleSet} />
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
