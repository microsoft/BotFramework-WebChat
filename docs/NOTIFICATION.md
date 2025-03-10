# Notification system

With Web Chat 4.8, you can start displaying notifications that represents information that are important for your customers. Currently, most notifications are rendered as toasts on the top of the screen. Connectivity status also become part of the notification system.

## Adding and updating notification

To make both add and update operation seamless, an "upsert" strategy is adopted. When you add a new notification, you will need to specify `id`. To update an existing notification, you will use the same `id` of the notification you want to update.

Markdown is supported for the message. When using Markdown, you are responsible to provide a screen reader version of your message via `alt` field. Hyperlinks will have `rel="noopener noreferrer"` and `target="_blank"` added for privacy reasons.

### Using Redux actions

<!-- prettier-ignore-start -->
```js
dispatch({
  type: 'WEB_CHAT/SET_NOTIFICATION',
  payload: {
    alt: 'Please read our privacy policy at https://privacy.microsoft.com.'
    id: 'your-id',
    level: 'info',
    message: 'Please read our [privacy policy](https://privacy.microsoft.com/).'
  }
});
```
<!-- prettier-ignore-end -->

### Using React hooks

<!-- prettier-ignore-start -->
```js
const setNotification = useSetNotification();

setNotification({
  alt: 'Please read our privacy policy at https://privacy.microsoft.com.'
  id: 'your-id',
  level: 'info',
  message: 'Please read our [privacy policy](https://privacy.microsoft.com/).'
});
```
<!-- prettier-ignore-end -->

## Dismissing a notification

To dismiss a notification, you will need to pass the `id` to identify individual notification.

### Using Redux actions

<!-- prettier-ignore-start -->
```js
dispatch({
  type: 'WEB_CHAT/DISMISS_NOTIFICATION',
  payload: {
    id: 'your-id'
  }
});
```
<!-- prettier-ignore-end -->

### Using React hooks

<!-- prettier-ignore-start -->
```js
const setNotification = useSetNotification();

setNotification({
  id: 'your-id'
});
```
<!-- prettier-ignore-end -->

## User experience

Web Chat implements toast notifications, which are located above the transcript. Multiple style options are offered to customize the UI. In case the design and user experience are not desirable in target applications, developers are welcomed to rebuild the UI.

### Order of notifications

Recently added and updated notifications will be moved to the top of the toaster.

### Accordion for multiple notifications

When two or more notifications are active on the screen, they will be collapsed into an accordion. The notification with highest importance will be promoted as the background color for the header.

There are 4 levels of notifications (in order of importance): `error`, `warn`, `info`, `success`.

### Postponing changes via debounce

To prevent notification getting updated and dismissed too frequently, the toaster UI will postpone any updates made within 400 ms of last update to the same notification. If there are multiple updates being made, only the last update will be applied when 400 ms has passed. Each notification will maintain their own debounce period.

The debounce timeout can be set via `styleOptions.notificationDebounceTimeout` (in milliseconds) and default to `400`.

### Connectivity status is not rendered

Although connectivity status is now part of the notification system and can be queried through `notifications` reducer or `useNotifications` hooks, it is not rendered as a toast. Instead, it will be rendered as an individual component between transcript and send box.

Slow connectivity timer can now be set using `styleOptions.slowConnectionAfter` (in milliseconds) and will be updated on-the-fly.

## Customization

### Styling toaster and toast

There are multiple style options for customizing visuals of toast and toaster. You can find them at [`packages/component/src/defaultStyleOptions.js`](https://github.com/microsoft/BotFramework-WebChat/tree/main/packages/component/src/defaultStyleOptions.js).

### Customizing notification UI

Developers can hide our toaster and implement their own notification UI from scratch. To hide the default toaster, set `styleOptions.hideToaster` to true (or truthy).

### Customizing toast appearance

To customizing the appearance of toast, developers can pass a prop named `toastMiddleware` with the following middleware signature:

<!-- prettier-ignore-start -->
```js
interface NotificationRendererArgs {
  notification: Notification
}

() =>
  (next: NotificationRendererArgs => (ReactElement | false)) =>
    (notificationRenderArg: NotificationRendererArgs) =>
      element: (ReactElement | false)
```
<!-- prettier-ignore-end -->

-  If the middleware will render the notification, it should return a `ReactElement`
-  If the middleware will hide the notification, it should return `false`
-  If the middleware will return the notification, it should call `next(notificationRenderArg)` to passthrough the notification

Please note that arguments passed to the middleware may change from time to time. Developers should pass all arguments to the next middleware. The recommended code pattern is:

<!-- prettier-ignore-start -->
```js
const middleware = () => next => (...args) => {
  const [
    {
      notification: { id, message }
    }
  ] = args;

  if (id === 'mynotification') {
    return <div>{message}</div>;
  }

  return next(...args);
};
```
<!-- prettier-ignore-end -->

When customizing toast appearance, developers are also responsible for its accessibility and localizability.
