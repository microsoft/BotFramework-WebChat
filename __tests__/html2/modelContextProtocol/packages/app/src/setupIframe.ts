/* eslint-disable no-console */

import {
  AppBridge,
  PostMessageTransport,
  type McpUiToolInputNotification,
  type McpUiToolResultNotification
} from '@modelcontextprotocol/ext-apps/app-bridge';
import type { Client } from '@modelcontextprotocol/sdk/client';

import { createAppTheme } from './createAppTheme';
import type { MCPToolUIResource } from './types/MCPToolUIResource';

const IMPLEMENTATION = {
  name: 'botframework-webchat-mcp-over-directline',
  version: '0.0.0-0'
};

async function setupIframe(
  client: Client,
  iframeElement: HTMLIFrameElement,
  uiResource: MCPToolUIResource,
  toolInput: McpUiToolInputNotification['params']['arguments'],
  toolResult: McpUiToolResultNotification['params']
) {
  const html = 'blob' in uiResource ? atob(uiResource.blob) : uiResource.text;

  const serverCapabilities = client.getServerCapabilities();

  const appBridge = new AppBridge(
    client,
    IMPLEMENTATION,
    {
      logging: {},
      sandbox: {},
      serverResources: {
        ...(typeof serverCapabilities?.resources?.listChanged === 'undefined'
          ? {}
          : { listChanged: serverCapabilities.resources.listChanged })
      },
      serverTools: {
        ...(typeof serverCapabilities?.tools?.listChanged === 'undefined'
          ? {}
          : { listChanged: serverCapabilities.tools.listChanged })
      }
    },
    {
      // TODO: Work on this.
      hostContext: {
        availableDisplayModes: ['inline', 'fullscreen'],
        platform: 'web',
        theme: document.documentElement.style.colorScheme === 'dark' ? 'dark' : 'light',
        styles: {
          variables: createAppTheme(iframeElement)
          // TODO: fonts
          // FluentUI seems to not provide web fonts if using only the theme provider
        }
      }
    }
  );

  console.log('Theme', createAppTheme(iframeElement));

  const initializedResolver = Promise.withResolvers();

  appBridge.oninitialized = initializedResolver.resolve.bind(initializedResolver);

  await appBridge.connect(new PostMessageTransport(iframeElement.contentWindow!, iframeElement.contentWindow!));

  await appBridge.sendSandboxResourceReady({ html, sandbox: 'allow-scripts' });

  await initializedResolver.promise;

  await appBridge.sendToolInput(toolInput ? { arguments: toolInput } : {});

  await appBridge.sendToolResult(toolResult);

  return appBridge;
}

export { setupIframe };

export default setupIframe;
