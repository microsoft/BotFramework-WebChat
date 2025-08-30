# Middleware

<!-- TODO: [P*] Stated that we do not allow activity (things in request) to be modified across middleware. -->

## Recipes

### Show channel message as a badge

This sample demonstrates the following:

- Add a new activity middleware component for a specific type of activity

#### Activity payload

```json
{
   "from": { "id": "channel", "role": "channel" },
   "text": "An agent has joined the conversation",
   "type": "message"
}
```

#### Screenshot

![Web Chat showing channel message as a badge](./media/middleware/channel-message.png)

#### Code snippet

```tsx
import ReactWebChat, { createStoreWithOptions } from 'botframework-webchat';
import { type WebChatActivity } from 'botframework-webchat-core';
import {
   activityComponent,
   createActivityPolymiddleware,
   type ActivityPolymiddlewareProps
} from 'botframework-webchat/middleware';
import React, { memo } from 'react';
import { render } from 'react-dom';

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
```

### Decorate activity with a border

This sample demonstrates the following:

- Decorate an activity
- Use [hooks](./HOOKS.md#usestyleoptions) within the activity middleware component

#### Screenshot

![Web Chat showing message with a blue outline](./media/middleware/decorate-message.png)

#### Code snippet

```tsx
import ReactWebChat, { createStoreWithOptions, hooks } from 'botframework-webchat';
import {
   activityComponent,
   createActivityPolymiddleware,
   type ActivityPolymiddlewareProps,
   type ActivityPolymiddlewareRenderer
} from 'botframework-webchat/middleware';
import React, { Fragment, memo, useMemo } from 'react';
import { render } from 'react-dom';

const { useStyleOptions } = hooks;

type MessageBorderProps = ActivityPolymiddlewareProps & {
   readonly render: ActivityPolymiddlewareRenderer | undefined;
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

const polymiddleware = [
   createActivityPolymiddleware(next => request => {
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
```

## Behaviors

### Legacy middleware with downstreamer of polymiddleware

<!-- TODO: [P*] Finish this. -->

<!--

Add test to prove this is working in:

- Legacy to legacy, override request/prop is okay
- Polymiddleware to legacy, override request/prop is NOT okay
- Legacy to polymiddleware, override request/prop is NOT okay

For better protection, legacy middleware cannot change and pass a new copy of activity to polymiddleware. Polymiddleware will always receive the original copy of the activity.

TODO: Should we add "allowModifiedRequest"? Should it be on a per-middleware level? Should it be an option in the upstreamer or downstreamer or both?

-->
