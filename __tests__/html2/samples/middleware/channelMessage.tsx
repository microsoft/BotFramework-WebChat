import ReactWebChat, { createStoreWithOptions } from 'botframework-webchat';
import { type WebChatActivity } from 'botframework-webchat-core';
import {
  activityComponent,
  createActivityPolyMiddleware,
  type ActivityPolyMiddlewareProps,
  type ActivityPolyMiddlewareRenderer
} from 'botframework-webchat/middleware';
import React from 'react';
import { render } from 'react-dom';

declare global {
  const host: any;
  const pageConditions: any;
  const pageElements: any;
  const run: (fn: () => Promise<void>) => Promise<void>;
  const testHelpers: any;
}

// Use code-splitting to speed up development time, just dummy import is sufficient.
// esbuild will split out botframework-webchat* packages into their own chunks.
await import('botframework-webchat');
await import('botframework-webchat/middleware');

run(async () => {
  // #region Sample code

  type MyActivityProps = ActivityPolyMiddlewareProps & {
    readonly activity: WebChatActivity & { type: 'message' };
    readonly render: ActivityPolyMiddlewareRenderer | undefined;
  };

  function ChannelMessage({ activity }: MyActivityProps) {
    return (
      <div className="channel-message">
        <div className="channel-message__body">{activity.text}</div>
      </div>
    );
  }

  const polyMiddleware = [
    createActivityPolyMiddleware(next => request => {
      const { activity } = request;

      if (activity.from.role === 'channel' && activity.type === 'message') {
        const render = next(request)?.render;

        return activityComponent<MyActivityProps>(ChannelMessage, {
          activity,
          render
        });
      }

      return next(request);
    })
  ];

  // #endregion Sample code

  (window as any).WebChat = { createStoreWithOptions };

  const { directLine, store } = testHelpers.createDirectLineEmulator();

  render(
    <ReactWebChat directLine={directLine} polyMiddleware={polyMiddleware} store={store} />,
    document.getElementsByTagName('main')[0]!
  );

  await pageConditions.uiConnected();

  directLine.emulateIncomingActivity({
    from: { id: 'channel', role: 'channel' },
    text: 'An agent has joined the conversation',
    type: 'message'
  });

  directLine.emulateIncomingActivity({
    from: { id: 'bot', role: 'bot' },
    text: 'Hello, World!',
    type: 'message'
  });

  await host.snapshot('local');
});
