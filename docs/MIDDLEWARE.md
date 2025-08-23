# Middleware

## Poly middleware

```tsx
import ReactWebChat, { createStoreWithOptions } from 'botframework-webchat';
import { type WebChatActivity } from 'botframework-webchat-core';
import {
   activityComponent,
   createActivityPolyMiddleware,
   type ActivityPolyMiddlewareProps,
   type ActivityPolyMiddlewareRenderer
} from 'botframework-webchat/middleware';

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
```
