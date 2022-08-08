import { useEffect, useState } from 'react';
import * as React from 'react';
import ReactWebChat, { createDirectLine, createDirectLineAppServiceExtension } from 'botframework-webchat';

import { IWebChatProps } from './IWebChatProps';
import styles from './WebChat.module.scss';

import type { VFC } from 'react';

const WebChat: VFC<IWebChatProps> = ({ domain, token }) => {
  const [directLine, setDirectLine] = useState();

  useEffect(() => {
    (async function () {
      setDirectLine(
        domain ? await createDirectLineAppServiceExtension({ domain, token }) : createDirectLine({ token })
      );
    })();
  }, [setDirectLine]);

  return <section className={styles.webChat}>{!!directLine && <ReactWebChat directLine={directLine} />}</section>;
};

export default WebChat;
