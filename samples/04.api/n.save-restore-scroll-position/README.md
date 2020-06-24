# Sample - Save and restore scroll position

This sample shows how to save and restore scroll positions using [Web Chat hooks API](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/HOOKS.md) in composition mode.

# Test out the hosted sample

![Demo](https://raw.githubusercontent.com/microsoft/BotFramework-WebChat/master/samples/04.api/n.save-restore-scroll-position/demo.gif)

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/04.api/n.save-restore-scroll-position)

# Things to try out

1. Type "help" in the send box
1. Scroll up to the midway
1. Click "Save current position"
1. Scroll to the top
1. Click "Scroll to saved position"

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

This sample is based on the [04.api/m.enable-composition-mode](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/04.api/m.enable-composition-mode) sample.

## Creating an overlay container

An overlay container will be added to house buttons that would save/restore scroll position.

### Add CSS style sheet

We will put the overlay container on the top of the page.

<!-- prettier-ignore-start -->
```css
.button-overlay {
  background-color: White;
  border-color: #393;
  border-radius: 4px;
  border-style: solid;
  border-width: 2px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  left: 10px;
  padding: 5px;
  position: absolute;
  top: 10px;
}

.button-overlay__button {
  margin: 5px;
}

.button-overlay__saved-position {
  margin: 5px;
  padding: 0;
}
```
<!-- prettier-ignore-end -->

### Create a new React component

Then, we will add the React component, which will house the buttons.

<!-- prettier-ignore-start -->
```js
const ButtonOverlay = () => {
  return (
    <div className="button-overlay">
    </div>
  );
};
```
<!-- prettier-ignore-end -->

### Add the React component to API container

Lastly, we will render the `<ButtonOverlay>` in the API container.

```diff
  ReactDOM.render(
    <Composer directLine={window.WebChat.createDirectLine({ token })}>
      <BasicWebChat />
+     <ButtonOverlay />
      <SendHelpOnConnect />
    </Composer>,
    document.getElementById('webchat')
  );
```

## Observing change of scroll positions

The [`useObserveScrollPosition`](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/HOOKS.md#useobservescrollposition) hook subscribes to scroll position changes. Since the scroll positions change rapidly during scrolling, the callback function should be as lightweight as possible.

The observed scroll position will be saved to a [ref](https://reactjs.org/docs/refs-and-the-dom.html), namely `scrollPositionRef`. The ref is as [an instance property](https://reactjs.org/docs/hooks-faq.html#is-there-something-like-instance-variables) and will not trigger render on set.

```diff
  const ButtonOverlay = () => {
+   const scrollPositionRef = useRef();
+
+   useObserveScrollPosition(
+     position => {
+       scrollPositionRef.current = position;
+     },
+     [scrollPositionRef]
+   );

    return (
      <div className="button-overlay">
      </div>
    );
  };
```

## Saving the observed scroll position

A button will be added to save the current position. When clicked, the most recently observed scroll position (`scrollPositionRef`) will be saved to a [state](https://reactjs.org/docs/hooks-reference.html#usestate) and displayed on the overlay.

```diff
  const ButtonOverlay = () => {
+   const [savedScrollPosition, setSavedScrollPosition] = useState();
    const scrollPositionRef = useRef();

    useObserveScrollPosition(
      position => {
        scrollPositionRef.current = { ...position };
      },
      [scrollPositionRef]
    );

+   const handleSavePositionClick = useCallback(() => setSavedScrollPosition(scrollPositionRef.current), [
+     scrollPositionRef,
+     setSavedScrollPosition
+   ]);

    return (
      <div className="button-overlay">
+       <button className="button-overlay__button" onClick={handleSavePositionClick} type="button">
+         Save current position
+       </button>
+       {savedScrollPosition && (
+         <pre className="button-overlay__saved-position">{JSON.stringify(savedScrollPosition, null, 2)}</pre>
+       )}
      </div>
    );
  };
```

## Restoring scroll position

Two buttons will be added for restoring the saved scroll position. When they are clicked, [`useScrollTo`](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/HOOKS.md#usescrollto) hook will be called to restore the saved position.

One of the button will scroll in a discrete manner (jump instantly to the scroll position), another button will scroll smoothly to the scroll position.

```diff
  const ButtonOverlay = () => {
    const [savedScrollPosition, setSavedScrollPosition] = useState();
    const scrollPositionRef = useRef();
+   const scrollTo = useScrollTo();

    useObserveScrollPosition(
      position => {
        scrollPositionRef.current = { ...position };
      },
      [scrollPositionRef]
    );

    const handleSavePositionClick = useCallback(() => setSavedScrollPosition(scrollPositionRef.current), [
      scrollPositionRef,
      setSavedScrollPosition
    ]);

+   const handleJumpToSavedPositionClick = useCallback(
+     () => scrollTo(savedScrollPosition, { behavior: 'auto' }),
+     [savedScrollPosition, scrollTo]
+   );
+
+   const handleScrollToSavedPositionClick = useCallback(
+     () => scrollTo(savedScrollPosition, { behavior: 'smooth' }),
+     [savedScrollPosition, scrollTo]
+   );

    return (
      <div className="button-overlay">
        <button className="button-overlay__button" onClick={handleSavePositionClick} type="button">
          Save current position
        </button>
+       <button
+         className="button-overlay__button"
+         disabled={!savedScrollPosition}
+         onClick={handleJumpToSavedPositionClick}
+         type="button"
+       >
+         Jump to saved position
+       </button>
+       <button
+         className="button-overlay__button"
+         disabled={!savedScrollPosition}
+         onClick={handleScrollToSavedPositionClick}
+         type="button"
+       >
+         Scroll to saved position
+       </button>
        {savedScrollPosition && (
          <pre className="button-overlay__saved-position">{JSON.stringify(savedScrollPosition, null, 2)}</pre>
        )}
      </div>
    );
  };
```

# Completed Code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Save and restore scroll position</title>
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
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        height: 100%;
        margin: auto;
        max-width: 480px;
        min-width: 360px;
      }

      .button-overlay {
        background-color: White;
        border-color: #393;
        border-radius: 4px;
        border-style: solid;
        border-width: 2px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        left: 10px;
        padding: 5px;
        position: absolute;
        top: 10px;
      }

      .button-overlay__button {
        margin: 5px;
      }

      .button-overlay__saved-position {
        margin: 5px;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="webchat"></div>
    <script type="text/babel" data-presets="env,stage-3,react">
      const {
        React: { useCallback, useEffect, useRef, useState },
        WebChat: {
          Components: { BasicWebChat, Composer },
          createDirectLine,
          hooks: { useConnectivityStatus, useObserveScrollPosition, useScrollTo, useScrollToEnd, useSendMessage }
        }
      } = window;

      (async function() {
        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

        const ButtonOverlay = () => {
          const [savedScrollPosition, setSavedScrollPosition] = useState();
          const scrollPositionRef = useRef();
          const scrollTo = useScrollTo();

          useObserveScrollPosition(
            position => {
              scrollPositionRef.current = { ...position };
            },
            [scrollPositionRef]
          );

          const handleSavePositionClick = useCallback(() => setSavedScrollPosition(scrollPositionRef.current), [
            scrollPositionRef,
            setSavedScrollPosition
          ]);

          const handleJumpToSavedPositionClick = useCallback(
            () => scrollTo(savedScrollPosition, { behavior: 'auto' }),
            [savedScrollPosition, scrollTo]
          );

          const handleScrollToSavedPositionClick = useCallback(
            () => scrollTo(savedScrollPosition, { behavior: 'smooth' }),
            [savedScrollPosition, scrollTo]
          );

          return (
            <div className="button-overlay">
              <button className="button-overlay__button" onClick={handleSavePositionClick} type="button">
                Save current position
              </button>
              <button
                className="button-overlay__button"
                disabled={!savedScrollPosition}
                onClick={handleJumpToSavedPositionClick}
                type="button"
              >
                Jump to saved position
              </button>
              <button
                className="button-overlay__button"
                disabled={!savedScrollPosition}
                onClick={handleScrollToSavedPositionClick}
                type="button"
              >
                Scroll to saved position
              </button>
              {savedScrollPosition && (
                <pre className="button-overlay__saved-position">{JSON.stringify(savedScrollPosition, null, 2)}</pre>
              )}
            </div>
          );
        };

        const SendHelpOnConnect = () => {
          const [connectivityStatus] = useConnectivityStatus();
          const sendMessage = useSendMessage();

          useEffect(() => {
            connectivityStatus === 'connected' && sendMessage('help');
          }, [connectivityStatus, sendMessage]);

          return false;
        };

        ReactDOM.render(
          <Composer directLine={window.WebChat.createDirectLine({ token })}>
            <BasicWebChat />
            <ButtonOverlay />
            <SendHelpOnConnect />
          </Composer>,
          document.getElementById('webchat')
        );
      })().catch(err => console.error(err));
    </script>
  </body>
</html>
```
<!-- prettier-ignore-end -->

# Further reading

-  [Web Chat hooks API](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/HOOKS.md)
   -  [`useObserveScrollPosition`](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/HOOKS.md#useobservescrollposition)
   -  [`useScrollTo`](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/HOOKS.md#usescrollto)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)
