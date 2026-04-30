# Sample - Replace the native feedback form with an inline host component

This sample shows how to keep Web Chat's native thumbs up/down behavior while replacing the native feedback form with a host-provided inline component mounted through `styleOptions.renderFeedbackFormOverrideComponent`.

The inline component simulates a third-party feedback library that only mounts when the user clicks a feedback button. The host component receives Web Chat callbacks and imperatively mounts the third-party UI when the component appears.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/h.feedback-form)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/05.custom-components/h.feedback-form` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type `help`
   -  Click thumbs up or thumbs down on the bot reply
   -  Observe the inline feedback host replacing the native textarea form
-  Submit feedback from the simulated third-party widget
  -  Observe Web Chat still submit the existing feedback invoke payload for the selected vote

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

First, define a simulated third-party library API that mounts into a DOM node imperatively.

```js
function handleFeedbackSubmitClick({ container, onCancel, onSubmit, reaction }) {
  function ThirdPartyFeedback() {
    return (
      <div className="thirdPartyFeedback">
        <h2 className="thirdPartyFeedback__header">Third-party feedback</h2>
        <p className="thirdPartyFeedback__body">You selected {reaction}.</p>
        <div className="thirdPartyFeedback__buttonBar">
          <button className="thirdPartyFeedback__button" onClick={onSubmit} type="button">
            Submit feedback
          </button>
          <button className="thirdPartyFeedback__button thirdPartyFeedback__button--secondary" onClick={onCancel} type="button">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  ReactDOM.render(<ThirdPartyFeedback />, container);

  return () => ReactDOM.unmountComponentAtNode(container);
}
```

Next, build an inline host component that receives the override context from `styleOptions.renderFeedbackFormOverrideComponent`. When it mounts, it calls the third-party API once and maps Web Chat helpers to the third-party callbacks.

```js
function InlineFeedbackHost({ onDismiss, onSubmit, selectedAction }) {
  const containerRef = React.useRef(null);
  const hasMountedRef = React.useRef(false);

  React.useEffect(() => {
    if (!containerRef.current || hasMountedRef.current) {
      return;
    }

    hasMountedRef.current = true;

    const dispose = handleFeedbackSubmitClick({
      container: containerRef.current,
      onCancel: onDismiss,
      onSubmit,
      reaction: selectedAction['@type'] === 'LikeAction' ? 'like' : 'dislike'
    });

    return dispose;
  }, [onDismiss, onSubmit, selectedAction]);

  return <div className="thirdPartyFeedbackHost" ref={containerRef} />;
}
```

Then, pass the override renderer into `ReactWebChat`. Web Chat will still own the thumbs buttons and selected-action state. The override only replaces the expanded form area.

```js
ReactDOM.render(
  <ReactWebChat
    directLine={window.WebChat.createDirectLine({ token })}
    styleOptions={{
      feedbackActionsPlacement: 'activity-actions',
      renderFeedbackFormOverrideComponent: ({ onDismiss, onSubmit, selectedAction }) => (
        <InlineFeedbackHost
          onDismiss={onDismiss}
          onSubmit={onSubmit}
          selectedAction={selectedAction}
        />
      )
    }}
  />,
  document.getElementById('webchat')
);
```

## Completed code

<!-- prettier-ignore-start -->
```html
<!doctype html>
<html lang="en-US">
  <head>
    <title>Web Chat: Replace the native feedback form with an inline host component</title>
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

      .thirdPartyFeedbackHost {
        margin-top: 8px;
      }

      .thirdPartyFeedback {
        background: #f5f8ff;
        border: solid 1px #c7d2fe;
        border-radius: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px;
      }

      .thirdPartyFeedback__header {
        font: 600 14px/1.4 'Segoe UI', Arial, sans-serif;
        margin: 0;
      }

      .thirdPartyFeedback__textarea {
        border: solid 1px #93a4ff;
        border-radius: 4px;
        font: 14px/1.4 'Segoe UI', Arial, sans-serif;
        min-height: 84px;
        padding: 8px;
        resize: vertical;
      }

      .thirdPartyFeedback__buttonBar {
        display: flex;
        gap: 8px;
      }

      .thirdPartyFeedback__button {
        background: #2946d1;
        border: 0;
        border-radius: 4px;
        color: White;
        cursor: pointer;
        font: 600 13px/1 'Segoe UI', Arial, sans-serif;
        padding: 10px 12px;
      }

      .thirdPartyFeedback__button--secondary {
        background: #dbe3ff;
        color: #1f2a5c;
      }
    </style>
  </head>

  <body>
    <div id="webchat" role="main"></div>
    <script type="text/babel" data-presets="es2015,react,stage-3">
      (async function () {
        const { ReactWebChat } = window.WebChat;
        const { useEffect, useRef, useState } = window.React;

        function handleFeedbackSubmitClick({ container, onCancel, onSubmit, reaction }) {
          function ThirdPartyFeedback() {
            return (
              <div className="thirdPartyFeedback">
                <h2 className="thirdPartyFeedback__header">Third-party feedback</h2>
                <p className="thirdPartyFeedback__body">You selected {reaction}.</p>
                <div className="thirdPartyFeedback__buttonBar">
                  <button className="thirdPartyFeedback__button" onClick={onSubmit} type="button">
                    Submit feedback
                  </button>
                  <button
                    className="thirdPartyFeedback__button thirdPartyFeedback__button--secondary"
                    onClick={onCancel}
                    type="button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          }

          window.ReactDOM.render(<ThirdPartyFeedback />, container);

          return () => window.ReactDOM.unmountComponentAtNode(container);
        }

        function InlineFeedbackHost({ onDismiss, onSubmit, selectedAction }) {
          const containerRef = useRef(null);
          const hasMountedRef = useRef(false);

          useEffect(() => {
            if (!containerRef.current || hasMountedRef.current) {
              return;
            }

            hasMountedRef.current = true;

            const dispose = handleFeedbackSubmitClick({
              container: containerRef.current,
              onCancel: onDismiss,
              onSubmit,
              reaction: selectedAction['@type'] === 'LikeAction' ? 'like' : 'dislike'
            });

            return dispose;
          }, [onDismiss, onSubmit, selectedAction]);

          return <div className="thirdPartyFeedbackHost" ref={containerRef} />;
        }

        const res = await fetch(
          'https://hawo-mockbot4-token-app.ambitiousflower-67725bfd.westus.azurecontainerapps.io/api/token/directline',
          { method: 'POST' }
        );
        const { token } = await res.json();

        window.ReactDOM.render(
          <ReactWebChat
            directLine={window.WebChat.createDirectLine({ token })}
            styleOptions={{
              feedbackActionsPlacement: 'activity-actions',
              renderFeedbackFormOverrideComponent: ({ onDismiss, onSubmit, selectedAction }) => (
                <InlineFeedbackHost
                  onDismiss={onDismiss}
                  onSubmit={onSubmit}
                  selectedAction={selectedAction}
                />
              )
            }}
          />,
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

-  [Activity status middleware sample](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/05.custom-components/g.activity-status)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)