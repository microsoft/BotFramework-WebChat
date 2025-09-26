# Hosting

Web Chat is versatile and can be hosted in many web app development scenario.

The hosting consists of 3 steps:

- [Importing code into the JavaScript environment](#importing-code)
- [Initializing chat adapter](#initializing-chat-adapter)
- [Rendering UI onto the page](#rendering-ui)

## Importing code

There are 3 ways to import the code:

- Pure HTML (bundler-less)
   - [Import via `<script type="importmap">`](#import-via-script-typeimportmap)
   - [(Deprecated) Import via `<script>`](#deprecated-import-via-script)
- Inside a web app project
   - [Import via `npm install` (with a bundler)](#import-via-npm-install)

### Import via `<script type="importmap">`

Importing via [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap) is the recommended method to import Web Chat code.

Copy and paste the following code snippet into your HTML page.

```html
<script type="importmap">
  {
    "imports": {
      "botframework-webchat": "https://cdn.botframework.com/latest/static/botframework-webchat.js",
      "react": "https://esm.sh/react.js@18",
      "react-dom": "https://esm.sh/react-dom.js@18"
    }
  }
</script>
<script type="module">
  import { createDirectLine, ReactWebChat, renderWebChat } from 'botframework-webchat';
</script>
```

By using import map and a smart CDN service (such as [esm.sh](https://esm.sh/) and [esm.run](https://esm.run/)), you can host all modern JavaScript features without the need of a bundler.

#### Deploying Web Chat a static web server or CDN

The ESM build for Web Chat is designed to be deployable to traditional static web server and traditional CDN. Smart CDN service is not required.

Download our primary tarball from npmjs and copy the `/static/` to your static web server or CDN. Then, modify the import map to point to your own service.

Deploy the bits to your own service is recommended for: sovereign cloud, airgapped environment, locked down Intranet, and environment with specific latency requirement.

#### Selecting React version

To choose between different version of React runtime, modify the import map and reference the version of your choice with your smart CDN service provider.

When deploying to locked down environment, the environment may not have access to live CDN services that provide React runtime in ESM flavor. Web Chat repacked React 16.8.6 and React 18 as ESM modules and you can use our repacked build to support these environments.

<details>
<summary>For React 18</summary>

```html
<script type="importmap">
  {
    "imports": {
      "botframework-webchat": "https://cdn.botframework.com/latest/static/botframework-webchat.js",
      "react": "https://cdn.botframework.com/latest/static/react-18.js",
      "react-dom": "https://cdn.botframework.com/latest/static/react-dom-18.js",
      "react-dom/client": "https://cdn.botframework.com/latest/static/react-dom-18/client.js"
    }
  }
</script>
```
</details>

<details>
<summary>For React 16.8.6</summary>

```html
<script type="importmap">
  {
    "imports": {
      "botframework-webchat": "https://cdn.botframework.com/latest/static/botframework-webchat.js",
      "react": "https://cdn.botframework.com/latest/static/react.js",
      "react-dom": "https://cdn.botframework.com/latest/static/react-dom.js",
      "react-dom/client": "https://cdn.botframework.com/latest/static/react-dom/client.js"
    }
  }
</script>
```
</details>

### (Deprecated) Import via `<script>`

> Notes: this hosting method is deprecated. Please use the ["HTML without a bundler"](#hosting-on-html-without-a-bundler) instead.

The following code snippet will host Web Chat using an IIFE build.

<details>
<summary>Click to show the deprecated code.</summary>

```html
<script src="https://cdn.botframework.com/latest/static/botframework-webchat.js"></script>
<script>
  const { createDirectLine, ReactWebChat, renderWebChat } = window.WebChat;

  // ...
</script>
```

This method is no longer recommended. W3C and browser vendors introduced a modern approach to import JavaScript code into the browser environment. Compare to traditional IIFE/UMD, ES Modules has zero pollution and more guardrails to prevent misuse.

### Import via `npm install`

This method will import Web Chat inside an existing web app project.

First, install Web Chat from npmjs:

```sh
npm install botframework-webchat
```

Then, import Web Chat into your code:

```tsx
import { createDirectLine, renderWebChat } from 'botframework-webchat';
```

## Initializing chat adapter

Chat adapter is an intermediate component which bridge between the chat service and Web Chat.

By using different chat adapter, Web Chat can connect to any type of chat service.

### Azure Bot Services: Direct Line

The chat adapter for Azure Bot Services (Direct Line) is bundled into Web Chat. A Direct Line token is required to establish the connection with Azure Bot Services. [This article](https://learn.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0#generate-a-direct-line-token) contains instructions on generating and renew a Direct Line token.

> Notes: the Direct Line token is the key to the conversation, which could contains user data. Please protect the token with great care.

```tsx
const directLine = createDirectLine({ token: '<direct-line-token>' });
```

## Rendering UI

After Web Chat is loaded into your JavaScript environment and a chat adapter instance is initialized, the last step is to render Web Chat on the page.

All the code snippet below assumes:

- Web Chat is already loaded into the JavaScript environment
- Chat adapter instance is initialized and stored in the `directLine` constant

### Using `renderWebChat` (without React)

This is for rendering Web Chat without React.

First, put a placeholder element into your page. This is where Web Chat will be rendered.

```html
<div id="webchat"></div>
```

Then, run the following JavaScript code to render Web Chat into the placeholder.

```tsx
renderWebChat({ directLine }, document.getElementById('webchat'));
```

### Using `<ReactWebChat>` component

For advanced web developers who already have a React-based web app project setup, mount Web Chat React component with the code snippet below:

```tsx
<ReactWebChat directLine={directLine} />
```
