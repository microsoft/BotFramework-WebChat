/* eslint-disable prefer-arrow-callback */

// Use code-splitting to speed up development time, just dummy import is sufficient.
// esbuild will split out botframework-webchat* packages into their own chunks.
await import('botframework-webchat');
await import('botframework-webchat/middleware');

// #region Sample code
import ReactWebChat, { createStoreWithOptions, hooks } from 'botframework-webchat';
import {
  activityComponent,
  createActivityPolyMiddleware,
  type ActivityPolyMiddlewareProps,
  type ActivityPolyMiddlewareRenderer
} from 'botframework-webchat/middleware';
import React, { Fragment, memo, useMemo } from 'react';
import { render } from 'react-dom';

const { useStyleOptions } = hooks;
// #endregion Sample code

run(async () => {
  // #region Sample code

  type MessageBorderProps = ActivityPolyMiddlewareProps & {
    readonly render: ActivityPolyMiddlewareRenderer | undefined;
  };

  const MessageBorder = memo<MessageBorderProps>(function MessageBorder({ render }) {
    const [{ accent }] = useStyleOptions();

    const style = useMemo(() => ({ outlineColor: accent }), [accent]);

    return (
      <div className="message-border" style={style}>
        <Fragment>{render?.({})}</Fragment>
      </div>
    );
  });

  const polyMiddleware = [
    createActivityPolyMiddleware(next => request => {
      const { activity } = request;

      if (activity.type === 'message') {
        const render = next(request)?.render;

        return activityComponent<MessageBorderProps>(MessageBorder, {
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

  await directLine.emulateIncomingActivity({
    from: { id: 'bot', role: 'bot' },
    text: 'Hello, World!',
    type: 'message'
  });

  await host.snapshot('local');
});
