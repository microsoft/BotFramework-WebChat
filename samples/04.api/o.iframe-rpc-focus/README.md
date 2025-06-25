# Sample - Cross-iframe RPC focus control

This sample demonstrates how to control WebChat focus from a parent application when WebChat is embedded in an iframe.

## Background

When WebChat is running inside an iframe, the parent application cannot directly access the DOM elements inside the iframe due to security restrictions. This sample shows how to use `postMessage` communication to send focus commands from the parent window to WebChat.

## What this sample does

- Demonstrates cross-iframe communication using `postMessage`
- Shows how to focus different parts of WebChat from an external application
- Provides a complete working example of parent-iframe RPC communication

## How to run this sample

### Option 1: Using npx serve (recommended)

1. Navigate to this sample's folder:
   ```bash
   cd samples/04.api/o.iframe-rpc-focus/
   ```
2. Start a local server:
   ```bash
   npx serve
   ```
3. Open your browser to the URL shown (typically http://localhost:3000)

### Option 2: Direct file opening

1. Navigate to this sample's folder: `samples/04.api/o.iframe-rpc-focus/`
2. Open `index.html` in your web browser
3. Note: Some features may not work due to CORS restrictions without a server

## How it works

### 1. PostMessage Listener

WebChat includes a `PostMessageListener` component that listens for messages from the parent window:

```typescript
// Inside WebChat iframe
window.addEventListener('message', event => {
   if (event.data.type === 'WEBCHAT_FOCUS') {
      await focus(event.data.target);
   }
});
```

### 2. Parent Application RPC

The parent application sends focus commands via postMessage:

```javascript
// From parent application
function focusWebChatSendBox() {
   const iframe = document.getElementById('webchat-iframe');
   iframe.contentWindow.postMessage(
      {
         type: 'WEBCHAT_FOCUS',
         target: 'sendBox'
      },
      '*'
   );
}
```

### 3. Available Focus Targets

- `'sendBox'` - Focus the send box input with keyboard
- `'sendBoxWithoutKeyboard'` - Focus the send box without showing virtual keyboard
- `'main'` - Focus the main transcript area

## Use cases

This pattern is useful when:

- WebChat is embedded in an iframe within a larger application
- You need to programmatically focus WebChat from outside the iframe
- You want to integrate WebChat focus control with external UI elements
- You're building a dashboard or portal that includes WebChat

## Implementation details

### CDN Version (Current Sample)

This sample uses the CDN version of WebChat with DOM-based focus fallback:

- Direct DOM manipulation to find and focus elements
- Uses common selectors to locate send box and transcript
- Works with any WebChat version from CDN

### Development Version (Recommended for Production)

For the full implementation with WebChat's `useFocus()` hook:

- Use the PostMessageListener component in packages/component/src/PostMessageListener.tsx
- Provides proper focus management, accessibility support, and screen reader compatibility
- Requires building WebChat from source or using a custom build

## Security considerations

The sample includes basic security measures:

- Only accepts messages from the parent window
- Validates message structure before processing
- Handles errors gracefully
