# Middleware

Middleware serves as a core element of Web Chat's architecture, enabling deep and cascaded UI customization.

Middleware operates in a cascading sequence, where the execution order plays a critical role. An upstream middleware can influence whether and how the downstream middleware renders. Middleware can perform the following operations:

- Add new UI
- Remove existing UI
- Replace existing UI
- Decorate existing UI

<!-- TODO: More docs -->

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

### Mixing polymiddleware with legacy middleware

> Notes: legacy middleware is deprecated and will be removed on or after 2027-08-16.

The following code snippet a legacy activity middleware followed by polymiddleware.

```tsx
const MyActivity = ({ request }) =>
  <div className="polymiddleware">{request.activity.text}</div>

const polymiddleware = [
  // Legacy activity middleware
  createActivityPolymiddlewareFromLegacy(() => next => request => {
    const child = next(request);

    return () => <div className="legacy">{child?.()}</div>;
  },
  // Polymiddleware handling activity request
  createActivityPolymiddleware(next => request => activityComponent(MyActivity, { request }))
]
```

For a message activity of "Hello, World!", it will render:

```html
<div class="legacy">
   <div class="polymiddleware">Hello, World!</div>
</div>
```

## Behaviors

### When will legacy middleware removed?

We started the polymiddleware in 2025-08-16. Based on our 2-year deprecation rule, legacy middleware will be removed on or after 2027-08-16. The following table should deprecation dates for various legacy middleware.

| Legacy middleware            | Remove on or after |
| ---------------------------- | ------------------ |
| Activity                     | 2027-08-16         |
| Activity status              | (TBD)              |
| Attachment                   | (TBD)              |
| Attachment for screen reader | (TBD)              |
| Avatar                       | (TBD)              |
| Card action                  | (TBD)              |
| Group activities             | (TBD)              |
| Scroll to end button         | (TBD)              |
| Send box                     | (TBD)              |
| Send box toolbar             | (TBD)              |
| Toast                        | (TBD)              |
| Typing indicator             | (TBD)              |

### Polymiddleware vs. legacy middleware

Polymiddleware is a unification of multiple legacy middleware into a single prop.

Previously, legacy middleware would sometimes return a render function and other times return a React component. Polymiddleware standardizes this behavior by requiring all middleware to return results created using a factory function.

Polymiddleware enforces immutability of requests. Unlike legacy middleware, an upstreamer in polymiddleware is prohibited from passing a modified request to a downstreamer.

### Why we think polymiddleware is better?

We start using middleware (or chain of responsibility) pattern for UI customization since late 2018 when React hooks is still in its womb. Over the past 7.5 years, we learnt a lot.

- In other languages, middleware is called "chain of responsibility"
   - Unique characteristics in Web Chat: bidirectional, synchronous, early termination
- Middleware overriding request offers flexibility but makes it very hard to debug
   - Rendering become inconsistent when a buggy middleware is in the chain
      - One middleware could change activity type and cause havoc
- Middleware should return render function than a React component
   - Impossible to set a default prop (binding props) in React component without wasted rendering and various performance issues
   - Hooks cannot be used in render function
   - Render function and React component can be transformed to each other
- Ability to use hooks in middleware will reduce props and moving parts
- Build-time vs. render-time
   - Request is build-time variable and primarily used to "decide whether middleware should add/remove/replace/decorate UI"
   - Props and hooks are render-time variable and is for "how to render the UI"
- All UI-rendering middleware should share same API signature
   - Card action and group activity middleware could be exempted because they are not UI-rendering
- Versioning API change is difficult
   - Factory function can help backward and forward compatibility
- Props should be hide using React context as a wrapper
- Rendering flavor/variant should be part of the request but not a separate middleware
   - "Attachment middleware for screen reader" could be avoided by adding a "for screen reader" flag in the request
- Everything should be a middleware, whether they are concrete (such as button and icon) or composed (such as send box)
- Error boundary should be the topmost middleware in the chain

### Polyfilling legacy middleware

Legacy middleware passed to deprecating props such as `activityMiddleware` will be polyfilled to polymiddleware after other polymiddleware passed via the `polymiddleware` prop.

Special polymiddleware factory functions allow input of legacy middleware and output as polymiddleware. This helps the transition period. However, these special factory functions is also marked as deprecated.

### Why `createActivityPolymiddlewareFromLegacy` accepts an arary of legacy middleware instead of one?

Polymiddleware enforces immutability of requests, which differs from the behavior of legacy middleware.

When multiple legacy middleware are passed as an array into `createActivityPolymiddlewareFromLegacy()`, they are combined into a single polymiddleware. This allows requests to be modified between legacy middleware, provided they are part of the array.
