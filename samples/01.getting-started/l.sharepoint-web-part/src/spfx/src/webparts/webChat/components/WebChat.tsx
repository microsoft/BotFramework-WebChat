import ReactWebChat, { createDirectLine, createDirectLineAppServiceExtension } from 'botframework-webchat';
import React, { memo, useEffect, useState } from 'react';

import { IWebChatProps } from './IWebChatProps';
import styles from './WebChat.module.scss';

function WebChat({ domain, token }: IWebChatProps) {
  const [directLine, setDirectLine] = useState();

  useEffect(() => {
    (async function () {
      setDirectLine(
        domain ? await createDirectLineAppServiceExtension({ domain, token }) : createDirectLine({ token })
      );
    })();
  }, [setDirectLine]);

  return <section className={styles.webChat}>{!!directLine && <ReactWebChat directLine={directLine} />}</section>;
}

export default memo(WebChat);
