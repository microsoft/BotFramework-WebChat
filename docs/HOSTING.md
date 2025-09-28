# Hosting

Web Chat is versatile and can be hosted in many web app scenarios.

There are three steps to host Web Chat in a web app:

1. [Importing code into the JavaScript environment](#step-1-importing-code)
1. [Constructing chat adapter](#step-2-constructing-chat-adapter)
1. [Rendering UI onto the page](#step-3-rendering-ui)

Each step provides multiple approaches to suit different development environments and requirements. These approaches can be mixed and matched to create a tailored solution for the scenario.

## Step 1: Importing code

There are three ways to import the code:

- Pure HTML (bundler-less)
  - [Import via `<script type="importmap">`](#esm-import-via-script-typeimportmap)
  - [Import via `<script src="...">`](#deprecated-iifeumd-import-via-script) (❌ Deprecated)
- Inside a web app project (with bundler)
  - [Import via `npm install`](#npm-import-via-npm-install)

### ESM: Import via `<script type="importmap">`

Importing via [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap) is the recommended method to import Web Chat into the JavaScript environment. You will need to import both Web Chat and React runtime into the browser environment.

Copy and paste the following code snippet into your HTML page. It imports React from [esm.sh](https://esm.sh/).

```html
<script type="importmap">
  {
    "imports": {
      "botframework-webchat": "https://cdn.botframework.com/4.19.0/static/botframework-webchat.js",
      "react": "https://esm.sh/react.js@18",
      "react-dom": "https://esm.sh/react-dom.js@18"
    }
  }
</script>

<script type="module">
  import { createDirectLine, ReactWebChat, renderWebChat } from 'botframework-webchat';

  // ...
</script>
```

<details>
<summary>Alternative: import React from jsDelivr</summary>

```html
<script type="importmap">
  {
    "imports": {
      "botframework-webchat": "/__dist__/packages/bundle/static/botframework-webchat.js",
      "react": "https://cdn.jsdelivr.net/npm/react@18.3.1/+esm",
      "react-dom": "https://cdn.jsdelivr.net/npm/react-dom@18.3.1/+esm",
      "react-dom/client": "https://cdn.jsdelivr.net/npm/react-dom@18.3.1/client/+esm"
    }
  }
</script>

<script type="module">
  import { createDirectLine, ReactWebChat, renderWebChat } from 'botframework-webchat';

  // ...
</script>
```
</details>

Using an import map alongside a smart CDN service (such as, [esm.sh](https://esm.sh/) or [esm.run](https://esm.run/)) allows you to leverage modern JavaScript features like lazy-loading and HTTP pipelining, enhancing performance and efficiency.

#### Deploying Web Chat to a static web server or CDN

The ESM build is designed to be deployable to traditional static web server and CDN. Smart CDN service is not required.

To deploy to a static web server, download the [primary tarball from NPM registry](https://npmjs.com/package/botframework-webchat). Then, copy the content of the `/static/` directory to your static web server or CDN. Lastly, modify the import map to point to your web server where the `/static/` directory resides.

Serving Web Chat code from your own service is recommended for these environments:

- Sovereign cloud
- Airgapped environment
- Locked down Intranet
- Environment with specific performance requirement
- Strict subresource integrity requirement

#### React runtime version

For React web apps, it is important to have all React components rendered with the same version and instance of the React runtime.

To choose between different version of React runtime, modify the import map and reference the version of your choice. React runtime must be loaded as ES Modules (ESM) instead of UMD. You may need to use a smart CDN service to load React runtime as ESM.

When deploying to locked down environment, clients may not have access to smart CDN service. For conveniences, Web Chat repacked React 16.8.6 (baseline) and React 18 (latest supported) as ESM under the `/static/` directory.

<details>
<summary>For React (latest supported)</summary>

```html
<script type="importmap">
  {
    "imports": {
      "botframework-webchat": "https://cdn.botframework.com/4.19.0/static/botframework-webchat.js",
      "react": "https://cdn.botframework.com/4.19.0/static/react.js",
      "react-dom": "https://cdn.botframework.com/4.19.0/static/react-dom.js",
      "react-dom/client": "https://cdn.botframework.com/4.19.0/static/react-dom/client.js"
    }
  }
</script>
```

</details>

<details>
<summary>For React 16.8.6 (baseline)</summary>

```html
<script type="importmap">
  {
    "imports": {
      "botframework-webchat": "https://cdn.botframework.com/4.19.0/static/botframework-webchat.js",
      "react": "https://cdn.botframework.com/4.19.0/static/react.baseline.js",
      "react-dom": "https://cdn.botframework.com/4.19.0/static/react-dom.baseline.js",
      "react-dom/client": "https://cdn.botframework.com/4.19.0/static/react-dom.baseline/client.js"
    }
  }
</script>
```

</details>

<details>
<summary>From React UMD (development only)</summary>

React runtime can also be loaded from UMD (`globalThis.React` and `globalThis.ReactDOM`) with React runtime version of your choice. This method is intended for development use only.

```html
<script src="https://unpkg.com/react@16.8.6/umd/react.development.js"></script>
<script src="https://unpkg.com/react-dom@16.8.6/umd/react-dom.development.js"></script>

<script type="importmap">
  {
    "imports": {
      "botframework-webchat": "https://cdn.botframework.com/4.19.0/static/botframework-webchat.js",
      "react": "https://cdn.botframework.com/4.19.0/static/react.umd-development.js",
      "react-dom": "https://cdn.botframework.com/4.19.0/static/react-dom.umd-development.js"
    }
  }
</script>
```

</details>

### (Deprecated) IIFE/UMD: Import via `<script>`

> Note: This method is deprecated and is no longer recommended. Please [import via `<script type="importmap">`](#esm-import-via-script-typeimportmap) instead.
>
>
> W3C and browser vendors introduced a modern approach to import JavaScript code into the browser environment. Compare to the traditional IIFE/UMD approach, ES Modules has zero pollution and more guardrails to prevent misuse.

The following code snippet will host Web Chat using an IIFE build.

<details>
<summary>Click to show the deprecated code</summary>

```html
<script src="https://cdn.botframework.com/4.19.0/static/botframework-webchat.js"></script>

<script>
  const { createDirectLine, ReactWebChat, renderWebChat } = window.WebChat;

  // ...
</script>
```

Web Chat will use the React runtime (in UMD flavor) from `window.React` variable if available. Otherwise, Web Chat will use the React runtime bundled in Web Chat.
</details>

### NPM: Import via `npm install`

This method will import Web Chat inside an existing web app project.

First, install Web Chat using `npm`:

```sh
npm install botframework-webchat
```

Then, import Web Chat into your code:

```tsx
import { createDirectLine, ReactWebChat, renderWebChat } from 'botframework-webchat';
```

## Step 2: Constructing chat adapter

> Note: Web Chat is a UI component, does not contains any network code, and is not responsible for communicating with the chat service. Web Chat render the messages (a.k.a. activities) provided by the chat adapter.

Chat adapter is an intermediate component which bridge between Web Chat and the underlying chat service.

By using different chat adapter, Web Chat can connect to different chat service.

### Azure Bot Services: Direct Line

The chat adapter for Azure Bot Services (Direct Line) is bundled into Web Chat. A Direct Line token is required to establish the connection with Azure Bot Services. [This article](https://learn.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0#generate-a-direct-line-token) contains instructions on generating and renew a Direct Line token.

> Note: the Direct Line token is the key to the conversation, which could contains user data. Please protect the token with great care.

```tsx
const directLine = createDirectLine({ token: '<direct-line-token>' });
```

## Step 3: Rendering UI

After Web Chat is loaded and chat adapter instance is constructed, the last step is to render Web Chat on the page.

> Note: Code snippets below assume the chat adapter instance is stored in the `directLine` constant.

### Using `renderWebChat()` (no React prior experience)

This approach is for rendering Web Chat without knowing how to use React.

First, put a placeholder element into your page. This is where Web Chat will be rendered.

```html
<div id="webchat"></div>
```

Then, run the following JavaScript code to render Web Chat into the placeholder.

```tsx
renderWebChat({ directLine }, document.getElementById('webchat'));
```

> Note: The `renderWebChat()` function is a simple wrapper around `render()` function in React DOM.

### Using `<ReactWebChat>` component

For advanced web developers who already have a React-based web app project setup, mount the Web Chat component with the code snippet below.

```tsx
<ReactWebChat directLine={directLine} />
```

This approach enables web app to communicate with Web Chat via API, including [middleware](./MIDDLEWARE.md), and [hooks](./HOOKS.md).

## Further reads

- [MDN: Import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap)
- Test cases
   - [ESM: Web Chat with React runtime from esm.sh](/__tests__/html2/simple/fatModule/esm.sh/simple.html)
   - [ESM: Web Chat with React runtime from jsDelivr](/__tests__/html2/simple/fatModule/esm.run/simple.html)
   - [ESM: Web Chat with repacked React 18 runtime](/__tests__/html2/simple/fatModule/simple.html)
   - [ESM: Web Chat as React component with custom polymiddleware](/__tests__/html2/simple/fatModule/supportPolymiddleware.reactDOMRender.html)
