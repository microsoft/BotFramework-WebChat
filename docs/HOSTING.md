# Hosting

Web Chat is versatile and can be hosted in many web app scenario.

There are 3 steps to host Web Chat in a web app:

1. [Importing code into the JavaScript environment](#importing-code)
1. [Constructing chat adapter](#constructing-chat-adapter)
1. [Rendering UI onto the page](#rendering-ui)

Each step provides multiple approaches to suit different development environments and requirements. These approaches can be mix and match to create a tailored solution for the scenario.

## Importing code

There are 3 ways to import the code:

- Pure HTML (bundler-less)
  - [Import via `<script type="importmap">`](#esm-import-via-script-typeimportmap)
  - (Deprecated) [Import via `<script src="...">`](#deprecated-iifeumd-import-via-script)
- Inside a web app project
  - [Import via `npm install` (with a bundler)](#npm-import-via-npm-install)

### ESM: Import via `<script type="importmap">`

[Import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap) is the recommended method to import Web Chat into the JavaScript environment.

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

Using an import map alongside a smart CDN service (such as, [esm.sh](https://esm.sh/) or [esm.run](https://esm.run/)) allows leveraging modern JavaScript features like lazy-loading and HTTP pipelining, enhancing performance and efficiency.

#### Deploying Web Chat to a static web server or CDN

The ESM build is designed to be deployable to traditional static web server and CDN. Smart CDN service is not required.

To deploy to a static web server, download the [primary tarball from NPM registry](https://npmjs.com/package/botframework-webchat). Then, copy the content of the `/static/` directory to your static web server or CDN. Lastly, modify the import map to point to your web server where the `/static/` directory resides.

Serving Web Chat code from your own service is recommended for these environments:

- Sovereign cloud
- Airgapped environment
- Locked down Intranet
- Environment with specific performance requirement
- Support strict subresource integrity

#### React versioning

For React web app, it is critical to have all React components rendered using the same version and instance of React runtime.

To choose between different version of React runtime, modify the import map and reference the version of your choice. React runtime must be loaded as ES Modules (ESM) instead of UMD. You may need to use a smart CDN service to load React runtime as ESM.

When deploying to locked down environment, clients may not have access to smart CDN service. For conveniences, Web Chat repacked React 16.8.6 and React 18 as ESM under the `/static/` directory.

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

### (Deprecated) IIFE/UMD: Import via `<script>`

> Notes: this hosting method is deprecated and is no longer recommended. Please [import via `<script type="importmap">`](#esm-import-via-script-typeimportmap) instead.
>
> W3C and browser vendors introduced a modern approach to import JavaScript code into the browser environment. Compare to the traditional IIFE/UMD approach, ES Modules has zero pollution and more guardrails to prevent misuse.

The following code snippet will host Web Chat using an IIFE build.

<details>
<summary>Click to show the deprecated code</summary>

```html
<script src="https://cdn.botframework.com/latest/static/botframework-webchat.js"></script>
<script>
  const { createDirectLine, ReactWebChat, renderWebChat } = window.WebChat;

  // ...
</script>
```

For React versioning, Web Chat will use the React runtime (in UMD flavor) from `window.React` variable. If it is not available, Web Chat will use the React runtime bundled with Web Chat.
</details>

### NPM: Import via `npm install`

This method will import Web Chat inside an existing web app project.

First, install Web Chat from npmjs:

```sh
npm install botframework-webchat
```

Then, import Web Chat into your code:

```tsx
import { createDirectLine, renderWebChat } from 'botframework-webchat';
```

## Constructing chat adapter

> Notes: Web Chat is a UI component, does not contains any network code, and is not responsible for communicating with the chat service. Web Chat render the messages (a.k.a. activities) provided by the chat adapter.

Chat adapter is an intermediate component which bridge between Web Chat and the underlying chat service.

By using different chat adapter, Web Chat can connect to different chat service.

### Azure Bot Services: Direct Line

The chat adapter for Azure Bot Services (Direct Line) is bundled into Web Chat. A Direct Line token is required to establish the connection with Azure Bot Services. [This article](https://learn.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0#generate-a-direct-line-token) contains instructions on generating and renew a Direct Line token.

> Notes: the Direct Line token is the key to the conversation, which could contains user data. Please protect the token with great care.

```tsx
const directLine = createDirectLine({ token: '<direct-line-token>' });
```

## Rendering UI

After Web Chat is loaded into your JavaScript environment and a chat adapter instance is constructed, the last step is to render Web Chat on the page.

> Notes: code snippets below assumes the chat adapter instance is stored in the `directLine` constant.

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

> Notes: `renderWebChat()` is a simple wrapper around `render()` function in React DOM.

### Using `<ReactWebChat>` component

For advanced web developers who already have a React-based web app project setup, mount the Web Chat component with the code snippet below.

```tsx
<ReactWebChat directLine={directLine} />
```

This approach enables web app to communicate with Web Chat via API, including components, middleware, and hooks.
