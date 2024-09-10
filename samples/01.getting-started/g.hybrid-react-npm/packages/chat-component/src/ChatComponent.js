import React, { useMemo, useState } from 'react';

import ReactWebChat, { createDirectLine } from 'botframework-webchat';

function ChatComponent({ styleOptions }) {
  const [directLine, setDirectLine] = useState();

  useMemo(async () => {
    const res = await fetch(
      'https://hawo-mockbot4-token-app.blueriver-ce85e8f0.westus.azurecontainerapps.io/api/token/directline',
      { method: 'POST' }
    );
    const { token } = await res.json();

    setDirectLine(createDirectLine({ token }));
  }, []);

  return (
    <section>
      <header>Chat component is using React {React.version}</header>
      <div className="react-container webchat">
        {!!directLine && <ReactWebChat directLine={directLine} styleOptions={styleOptions} />}
      </div>
    </section>
  );
}

export default ChatComponent;
