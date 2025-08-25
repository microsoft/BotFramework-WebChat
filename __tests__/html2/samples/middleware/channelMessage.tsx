/* eslint-disable prefer-arrow-callback */

// Use code-splitting to speed up development time, just dummy import is sufficient.
// esbuild will split out botframework-webchat* packages into their own chunks.
await import('botframework-webchat');
await import('botframework-webchat/middleware');

// #region Sample code
import ReactWebChat, { createStoreWithOptions } from 'botframework-webchat';
import { type WebChatActivity } from 'botframework-webchat-core';
import {
  activityComponent,
  createActivityPolymiddleware,
  type ActivityPolymiddlewareProps
} from 'botframework-webchat/middleware';
import React, { memo } from 'react';
import { render } from 'react-dom';
// #endregion Sample code

run(async () => {
  // #region Sample code

  type ChannelMessageProps = ActivityPolymiddlewareProps & {
    readonly activity: WebChatActivity & {
      type: 'message';
    };
  };

  const ChannelMessage = memo<ChannelMessageProps>(function ChannelMessage({ activity }) {
    return (
      <div className="channel-message">
        <div className="channel-message__body">{activity.text}</div>
      </div>
    );
  });

  const polymiddleware = [
    createActivityPolymiddleware(next => request => {
      const { activity } = request;

      if (activity.from.role === 'channel' && activity.type === 'message') {
        return activityComponent(ChannelMessage, { activity });
      }

      return next(request);
    })
  ];

  // #endregion Sample code

  (window as any).WebChat = { createStoreWithOptions };

  const { directLine, store } = testHelpers.createDirectLineEmulator();

  render(
    <ReactWebChat directLine={directLine} polymiddleware={polymiddleware} store={store} />,
    document.getElementsByTagName('main')[0]!
  );

  await pageConditions.uiConnected();

  await directLine.emulateIncomingActivity({
    from: { id: 'channel', role: 'channel' },
    text: 'An agent has joined the conversation',
    type: 'message'
  });

  await directLine.emulateIncomingActivity({
    from: { id: 'bot', role: 'bot' },
    text: 'Hello, World!',
    type: 'message'
  });

  await host.snapshot('local');
});
