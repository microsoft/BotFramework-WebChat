# Sample - Notification system

This sample shows how to add notifications to the toast UI.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/i.notification)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/05.custom-components/i.notification` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Click "Yes" on the privacy policy toast
   -  Observe the toast will be changed to show confirmation
-  Click "No" on the privacy policy toast
   -  Observe the toast will be dismissed

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

This sample is based on [`01.getting-started/a.full-bundle`](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/a.full-bundle).

In this sample, a privacy notice will be [shown as a generic toast](#privacy-policy-as-a-generic-toast). Then, it will be turned into a [custom toasts with "Yes" and "No" button](#customizing-the-privacy-policy-toast).

### Privacy policy as a generic toast

When connected, privacy policy will appear as a toast above the transcript.

A middleware will be added to Redux store to intercept `DIRECT_LINE/CONNECT_FULFILLED` action. And `WEB_CHAT/SET_NOTIFICATION` action will be dispatched with the following payload.

<!-- prettier-ignore-start -->
```js
{
  type: 'WEB_CHAT/SET_NOTIFICATION',
  payload: {
    data: { accepted: false },
    id: 'privacypolicy',
    level: 'info',
    message: 'Please read our [privacy policy](https://privacy.microsoft.com/).'
  }
}
```
<!-- prettier-ignore-end -->

The completed code will be:

```diff
  const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
  const { token } = await res.json();

+ const store = window.WebChat.createStore({}, ({ dispatch }) => next => action => {
+   if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
+     dispatch({
+       type: 'WEB_CHAT/SET_NOTIFICATION',
+       payload: {
+         data: { accepted: false },
+         id: 'privacypolicy',
+         level: 'info'
+       }
+     });
+   }
+
+   return next(action);
+ });

  window.WebChat.renderWebChat(
    {
-     directLine: window.WebChat.createDirectLine({ token })
+     directLine: window.WebChat.createDirectLine({ token }),
+     store
    },
    document.getElementById('webchat')
  );
```

### Customizing the privacy policy toast

A toast middleware will be added to intercept the rendering of the privacy policy toast. The toast will show agree and deny buttons. When agree button is clicked, it will send a postback to the bot and display confirmation. Otherwise, when the disagree button is clicked, it will dismiss the notification.

First, implement a React component for the privacy policy toast without any logic.

```js
const PrivacyPolicyToast = () => {
   return (
      <div aria-label="Privacy policy" role="dialog" className="app__privacyPolicyToast">
         <i aria-hidden={true} className="ms-Icon ms-Icon--Compare app__privacyPolicyToast__icon" />
         <span>
            Do you consent to our{' '}
            <a href="https://privacy.microsoft.com/" rel="noopener noreferrer" target="_blank">
               privacy policy
            </a>
            ?
         </span>
         <button className="app__privacyPolicyToast__button" type="button">
            Yes
         </button>{' '}
         <button className="app__privacyPolicyToast__button" type="button">
            No
         </button>
      </div>
   );
};
```

Then, style the toast using the following CSS:

> The icon inlined is from [Office UI Fabric](https://uifabricicons.azurewebsites.net/) and is subject to the terms of the license at https://aka.ms/fabric-assets-license.

<!-- prettier-ignore-start -->
```css
@font-face {
  font-family: 'FabricMDL2Icons';
  src: url('data:application/octet-stream;base64,d09GRgABAAAAAAjwAA4AAAAAENgAA6uFAAAAAAAAAAAAAAAAAAAAAAAAAABPUy8yAAABRAAAAEgAAABgOp12JmNtYXAAAAGMAAAAMgAAAUIADfH9Y3Z0IAAAAcAAAAAgAAAAKgnZCa9mcGdtAAAB4AAAAPAAAAFZ/J7mjmdhc3AAAALQAAAADAAAAAwACAAbZ2x5ZgAAAtwAAAD7AAABOO5k/ItoZWFkAAAD2AAAADIAAAA2APeWImhoZWEAAAQMAAAAGQAAACQPgQiDaG10eAAABCgAAAAIAAAACA0qAKZsb2NhAAAEMAAAAAYAAAAGAJwAFm1heHAAAAQ4AAAAHQAAACAAHQGxbmFtZQAABFgAAAP4AAAJ+pKZ8VRwb3N0AAAIUAAAABQAAAAg/1EAeXByZXAAAAhkAAAAiQAAANN4vfIOeJxjYGGbyjiBgZWBgXUWqzEDA6M0hGa+yJDGJMTBysrFyMQIBgxAIMCAAL7BCgoMDh/CP4RzgPkQkgGsjgXCU2BgAADgrwhueJxjYGBgZoBgGQZGBhCwAfIYwXwWBgUgzQKEQP6H8P//IST/KqhKBkY2hhEPAJ6dB/gAAHicY9BiCGUoYGhgWMXIwNjA7MB4gMEBiwgQAACqHAeVeJxdj79Ow0AMxnMktIQnQDohnXUqQ5WInemGSyTUJSUM56WA1Eqk74CUhcUDz+JuGfNiCMwR/i62v8/6fL9zp/nJfHacpUcqKVacN+Gg1AsO6u2Z/fkhT+82ZWFM1XlW92XBagmia04X9U2waMjQ9ZZMbR4ftpwtYpfFjvDScNKGTuptAHaov8cd4lU8ksUjhBLfT/F9jEv6tSxWhtOLJqwD916z86gBTMVjE3j0GhB/yKQ/dWcT42w5ZdvATnOCRJ/KAvdEmoT7S49/9aCS/4b7bci/q0H1Tdz0FvSHYcGCsKGXZ9tQCRpg+Q6E/GTGAAEAAgAIAAr//wAPeJxjYGJYxsDA0sJaxsDMwM7AYC6oKKiqKKi4jPnen21M2/56MbCW/eqawuLHAARsIIK9gYOBwZrBjsGVwYfBnyGMgYFR2FhUmY9ZWUmPSV3Z1FhYUVCMRdxYVNHU2EwFaB66rClQQlRRlJVZkdnIzFxRjpFRj1FZiY2dES7A5nwtXUzEM77Q1rYw3lNELP3aP+fljNrVm382bK5m1F7+D1P+MHNDA3PDL4ZJjCqTXMuU/7kol7E4pjwqK3uUwvwHSZCd4W9Dg2W8s6qqc7xlA1PDrzruxqKGhqJGbtYmVBkQOPXP6z+Di42Ny18Ge0dHe9ZtMD4DACGTVZwAeJxjYGRgYGBe3Rq0/tGveH6brwzcHAwgsP/vwQYQfSvijjyIZm8Ai3MyMIEoAIXnC4gAAHicY2BkYOBgAAEw2cDewMDIgAqYABa2ARwAAAAFKgCmCAAAAAAAABYAnAAAeJxjYGRgYGBiCGdgYwABRjDJBcKMkSAmAAwGANAAAAB4nLVUT4sbNxR/XjvZLWmWUijkqEMpm8WMkw1kaXJakuaUvWzCQi4FeUaeERmPhKTJMKWHHnPox+gl0E9RWuix536Cnnvqse89aWxv7IZtoR6s+enp/f29pwGAO6MvYATx9wD/EY/gU9xFvAf78FXCY5Q/T3iC+OuEb8DHYBO+CZ/Atwnvw5fwfcIH8Bn8kvAtOIbfE749+nk0SfgQjvd+xSijyUe4K/b+THgEn48vE96Dw/E3CY9R/jbhCeIfE74Bd8a/JXwTxPiPhPfBTQ4SPoDjyeDnFryc/JDw7fHbyV8JH8LLg+9+eidO7t0/Fec6d8abRRBPjLPGyaBNk4mzuhYXuqyCFxfKK/dGFdkzOXc6F+dPn5+IM+9V8BeqbGvptg+2JZfKefQsHmQPT+MpHcazF6o0SmgvpAhOFmop3WthFiJUaiO/0pnWkjg3SysbrXy2M/kqBPtoNuu6LlsO5xnazEJvTemkrfrZwjTBz9bmvrW21qoQdJCJV6YVS9mL1itMAhMjsQhG5E7JoKai0N7Wsp8K2RTCOo2nOaoofEsvrHJLHQK6m/dcRK1z1ZAvPPDCuAEsKMJ0u1TrTNHmYSqIebSdks0QQDeiq3RebWTWYVDd5HVbYJtW2Zum7sWRvivUco65rNXRw4eyZfVCN6VwygfsFLG6DkDmK1+PmYEjjVGCWlILnMaohema2sjiKnsyUqUclWMwFK5tsG0QhaIySadStb3KKA5j0yd1agg6RH4qPdeYc3b9bsM7EHAC9+A+nCI6Bw05ODDg8b+AgLIniBzeeVolSjSiBjI8OYMaHwEXKCuhwjPPO4VvhdpvcC1Q8xnazXFPvinGU/yynLC9Z02yI6sSWvQnUfM6FtfRueQ8fMpZ4Jcug4dY6abtYLlp94KzMbgK1KGqJP4DM1CgdMlZvkYZsUQnFevu4q/kfYsMDto5vpe4l5iTZrayf8E88RxQ+ghm+HT8ZOjvffssxZkh7tlLyX4seuhRumBvVO1sZ3TPOVvsiOY+ipUF9f4V1ySYiR7fLXMXmYiMDdokM1y1Qw2qQ8EU9wXrWe54zxLig+JY7ky0zZMXlfaSfVvuK9Uc+Iys5pzH0ImaKyKrIa9o4bkLbkuyWNUwvVZXLe8LtMlxP2W+4szHuNNVnPcr0DyJHfOU47qbsy5VSto5VtPy3BU7uSebmtER6t/FN03oPPGyy3vM4b9yu/ZesKcSZY7nOKQ7NczqrgqG6Nt5Pd6YAaok1hI43nALyH+stUBJx5UbvpUfmj15ZaoU98WkNVYVccs3q2VLynbo5uCHNGu+yf88o/HL2KTOrL0PN0Qnlml+KN85Mx17+z/c7b8Bhr44mnicY2BmAIP/fgzlDJiACQApLAHKeJzbwKDNsImRk0mbcRMXiNzO1ZobaqvKwKG9nTs12EFPBsTiifCw0JAEsXidzbXlhUEsPh0VGREeEItfTkKYjwPEEuDj4WRnAbEEwQDEEtowoSDAAMhi2M4IN5oJbjQz3GgWuNGscKPZ5CShRrPDjeaAG80JN3qTMCO79gYGBdfaTAkXAMQBKBoAAAA=')
    format('truetype');
}

.ms-Icon {
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  display: inline-block;
  font-family: 'FabricMDL2Icons';
  font-style: normal;
  font-weight: normal;
  speak: none;
}

.ms-Icon--Compare:before {
  content: '\F057';
}

.app__privacyPolicyToast {
  align-items: center;
  color: #105e7d;
  display: flex;
  font-family: 'Calibri', 'Helvetica Neue', 'Arial', 'sans-serif';
  font-size: 14px;
  height: 100%;
}

.app__privacyPolicyToast__icon {
  text-align: center;
  width: 36px;
}

.app__privacyPolicyToast__button {
  appearance: none;
  background-color: rgba(255, 255, 255, 0.8);
  border: solid 1px rgba(0, 0, 0, 0.3);
  border-radius: 3px;
  color: initial;
  font-family: inherit;
  font-size: inherit;
  margin: 0 0 0 4px;
  outline: 0;
}

.app__privacyPolicyToast__button:hover {
  background-color: rgba(0, 0, 0, 0.12);
}

.app__privacyPolicyToast__button:focus {
  border-color: rgba(0, 0, 0, 0.7);
}
```
<!-- prettier-ignore-end -->

Next, add the logic to perform postback and dismiss.

-  When the "Yes" button is clicked, it will
   1. Send a postback to the bot to indicate the end-user has accept the privacy policy
   1. Turn the toast into a consent confirmation and use Markdown to render the message
-  When the "No" button is clicked, it will dismiss the notification immediately

```diff
+ const { useCallback, useMemo } = window.React;
+ const {
+   hooks: { useDismissNotification, useSendPostBack, useSetNotification }
+ } = window.WebChat;

  const PrivacyPolicyToast = () => {
+   const sendPostBack = useSendPostBack();
+   const dismissNotification = useDismissNotification();
+   const setNotification = useSetNotification();
+
+   const handleDismissNotification = useCallback(() => dismissNotification('privacypolicy'), [
+     dismissNotification
+   ]);
+
+   const handleAgreeClick = useCallback(() => {
+     sendPostBack({ acceptPrivacyPolicy: true });
+
+     setNotification({
+       data: { accepted: true },
+       id: 'privacypolicy',
+       level: 'success',
+       message: 'Thanks for accepting our [privacy policy](https://privacy.microsoft.com/).'
+     });
+   }, []);

    return (
      <div aria-label="Privacy policy" role="dialog" className="app__privacyPolicyToast">
        <i aria-hidden={true} className="ms-Icon ms-Icon--Compare app__privacyPolicyToast__icon" />
        <span>
          Do you consent to our{' '}
          <a href="https://privacy.microsoft.com/" rel="noopener noreferrer" target="_blank">
            privacy policy
          </a>
          ?
        </span>
-       <button className="app__privacyPolicyToast__button" type="button">
+       <button className="app__privacyPolicyToast__button" onClick={handleAgreeClick} type="button">
          Yes
        </button>{' '}
-       <button className="app__privacyPolicyToast__button" type="button">
+       <button className="app__privacyPolicyToast__button" onClick={handleDismissNotification} type="button">
          No
        </button>
      </div>
    );
  };
```

Lastly, we will add a toast middleware to intercept the render of toasts. The middleware will override the rendering for toast with ID `privacypolicy` and is not accepted by the end-user yet.

When end-user give consent to the privacy policy, we will use the default renderer to render the toast.

```diff
+ const toastMiddleware = () => next => ({ notification, ...otherArgs }) => {
+   if (notification.id === 'privacypolicy' && !notification.data.accepted) {
+     return <PrivacyPolicyToast />;
+   }
+
+   return next({ notification, ...otherArgs });
+ };

  window.WebChat.renderWebChat(
    {
      directLine: window.WebChat.createDirectLine({ token }),
+     toastMiddleware,
      store
    },
    document.getElementById('webchat')
  );
```

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Notification system</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script crossorigin="anonymous" src="https://unpkg.com/@babel/standalone@7.8.7/babel.min.js"></script>
    <script crossorigin="anonymous" src="https://unpkg.com/react@16.8.6/umd/react.development.js"></script>
    <script crossorigin="anonymous" src="https://unpkg.com/react-dom@16.8.6/umd/react-dom.development.js"></script>
    <script crossorigin="anonymous" src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
    <style>
      html,
      body {
        height: 100%;
      }

      body {
        margin: 0;
      }

      #webchat {
        height: 100%;
        width: 100%;
      }

      @font-face {
        font-family: 'FabricMDL2Icons';
        src: url('data:application/octet-stream;base64,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')
          format('truetype');
      }

      .ms-Icon {
        -moz-osx-font-smoothing: grayscale;
        -webkit-font-smoothing: antialiased;
        display: inline-block;
        font-family: 'FabricMDL2Icons';
        font-style: normal;
        font-weight: normal;
        speak: none;
      }

      .ms-Icon--Compare:before {
        content: '\F057';
      }

      .app__privacyPolicyToast {
        align-items: center;
        color: #105e7d;
        display: flex;
        font-family: 'Calibri', 'Helvetica Neue', 'Arial', 'sans-serif';
        font-size: 14px;
        min-height: 32px;
      }

      .app__privacyPolicyToast__icon {
        text-align: center;
        width: 36px;
      }

      .app__privacyPolicyToast__button {
        appearance: none;
        background-color: rgba(255, 255, 255, 0.8);
        border: solid 1px rgba(0, 0, 0, 0.3);
        border-radius: 3px;
        color: initial;
        font-family: inherit;
        font-size: inherit;
        margin: 0 0 0 4px;
        outline: 0;
      }

      .app__privacyPolicyToast__button:hover {
        background-color: rgba(0, 0, 0, 0.12);
      }

      .app__privacyPolicyToast__button:focus {
        border-color: rgba(0, 0, 0, 0.7);
      }
    </style>
  </head>
  <body>
    <div id="webchat" role="main"></div>
    <script type="text/babel" data-presets="es2015,react,stage-3">
      (async function() {

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();
        const { useCallback, useMemo } = window.React;
        const {
          hooks: { useDismissNotification, useSendPostBack, useSetNotification }
        } = window.WebChat;

        const store = window.WebChat.createStore({}, ({ dispatch }) => next => action => {
          if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
            dispatch({
              type: 'WEB_CHAT/SET_NOTIFICATION',
              payload: {
                data: { accepted: false },
                id: 'privacypolicy',
                level: 'info'
              }
            });

            dispatch({
              type: 'WEB_CHAT/SET_NOTIFICATION',
              payload: {
                id: 'very long',
                level: 'info',
                message:
                  'Velit anim sunt cupidatat aliquip fugiat eiusmod cillum. Sit est elit deserunt laborum do laborum consectetur velit velit. Cillum in consectetur sint ullamco dolore adipisicing id nostrud amet dolore in reprehenderit. Sint mollit proident elit do deserunt eu exercitation ullamco consectetur duis nisi. Ipsum adipisicing reprehenderit commodo deserunt proident magna. Nulla aliquip fugiat officia consequat esse nulla ea velit sint enim.'
              }
            });
          }

          return next(action);
        });

        const PrivacyPolicyToast = () => {
          const sendPostBack = useSendPostBack();
          const dismissNotification = useDismissNotification();
          const setNotification = useSetNotification();

          const handleDismissNotification = useCallback(() => dismissNotification('privacypolicy'), [
            dismissNotification
          ]);

          const handleAgreeClick = useCallback(() => {
            sendPostBack({ acceptPrivacyPolicy: true });

            setNotification({
              data: { accepted: true },
              id: 'privacypolicy',
              level: 'success',
              message: 'Thanks for accepting our [privacy policy](https://privacy.microsoft.com/).'
            });
          }, []);

          return (
            <div aria-label="Privacy policy" role="dialog" className="app__privacyPolicyToast">
              <i aria-hidden={true} className="ms-Icon ms-Icon--Compare app__privacyPolicyToast__icon" />
              <span>
                Do you consent to our{' '}
                <a href="https://privacy.microsoft.com/" rel="noopener noreferrer" target="_blank">
                  privacy policy
                </a>
                ?
              </span>
              <button className="app__privacyPolicyToast__button" onClick={handleAgreeClick} type="button">
                Yes
              </button>{' '}
              <button className="app__privacyPolicyToast__button" onClick={handleDismissNotification} type="button">
                No
              </button>
            </div>
          );
        };

        const toastMiddleware = () => next => ({ notification, ...otherArgs }) => {
          if (notification.id === 'privacypolicy' && !notification.data.accepted) {
            return <PrivacyPolicyToast />;
          }

          return next({ notification, ...otherArgs });
        };

        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({ token }),
            toastMiddleware,
            store
          },
          document.getElementById('webchat')
        );

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>
```
<!-- prettier-ignore-end -->

# Further reading

-  [Web Chat notification system](https://github.com/microsoft/BotFramework-WebChat/tree/master/docs/NOTIFICATION.md)
-  [React Hook for setting notification](https://github.com/microsoft/BotFramework-WebChat/tree/master/docs/HOOKS.md#usesetnotification)
-  [React Hook for dismissing notification](https://github.com/microsoft/BotFramework-WebChat/tree/master/docs/HOOKS.md#usedismissnotification)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
