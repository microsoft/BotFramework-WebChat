import {
  AppBridge,
  buildAllowAttribute,
  PostMessageTransport,
  type McpUiResourceCsp,
  type McpUiResourcePermissions,
  type McpUiSandboxProxyReadyNotification
} from '@modelcontextprotocol/ext-apps/app-bridge';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const IMPLEMENTATION = {
  name: 'botframework-webchat-mcp-over-directline',
  version: '0.0.0-0'
};

const SANDBOX_PROXY_BASE_URL = './sandbox.html';

export async function loadSandboxProxy(
  iframe: HTMLIFrameElement,
  csp?: McpUiResourceCsp,
  permissions?: McpUiResourcePermissions
): Promise<boolean> {
  // Prevent reload
  if (iframe.src) {
    return Promise.resolve(false);
  }

  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-forms');

  // Set Permission Policy allow attribute based on requested permissions
  const allowAttribute = buildAllowAttribute(permissions);
  if (allowAttribute) {
    iframe.setAttribute('allow', allowAttribute);
  }

  const readyNotification: McpUiSandboxProxyReadyNotification['method'] = 'ui/notifications/sandbox-proxy-ready';

  const readyPromise = new Promise<boolean>(resolve => {
    const listener = ({ source, data }: MessageEvent) => {
      if (source === iframe.contentWindow && data?.method === readyNotification) {
        console.info('Sandbox proxy loaded');
        window.removeEventListener('message', listener);
        resolve(true);
      }
    };
    window.addEventListener('message', listener);
  });

  // Build sandbox URL with CSP query param for HTTP header-based CSP
  const sandboxUrl = new URL(SANDBOX_PROXY_BASE_URL, location.href);
  if (csp) {
    sandboxUrl.searchParams.set('csp', JSON.stringify(csp));
  }

  console.info('Loading sandbox proxy...', csp ? `(CSP: ${JSON.stringify(csp)})` : '');
  // iframe.src = sandboxUrl.href;

  const sandboxHTML = await (await fetch('./sandbox.html')).text();

  // eslint-disable-next-line require-atomic-updates
  iframe.srcdoc = sandboxHTML;

  return readyPromise;
}

async function setupIframe(iframeElement: HTMLIFrameElement, url: URL, html: string, input: Record<string, unknown>) {
  console.log('!!!!!!!!!!!!!!!!!', iframeElement);

  const client = new Client(IMPLEMENTATION);

  await client.connect(new StreamableHTTPClientTransport(url));

  const serverCapabilities = client.getServerCapabilities();

  const appBridge = new AppBridge(
    client,
    IMPLEMENTATION,
    {
      logging: {},
      sandbox: {},
      serverResources: serverCapabilities?.resources,
      serverTools: serverCapabilities?.tools
    },
    {
      hostContext: {
        availableDisplayModes: ['inline'],
        platform: 'web'
      }
    }
  );

  const initializedPromise = new Promise<void>(resolve => {
    appBridge.oninitialized = () => {
      console.log('oninitialized');

      resolve();
    };
  });

  console.log('connecting');

  await appBridge.connect(new PostMessageTransport(iframeElement.contentWindow!, iframeElement.contentWindow!));

  console.log('connected');

  await appBridge.sendSandboxResourceReady({ html, sandbox: 'allow-scripts' });

  console.log('initializing');

  await initializedPromise;

  console.log('send tool input');
  await appBridge.sendToolInput({ arguments: input });

  return { sendToolResult: appBridge.sendToolResult.bind(appBridge) };
}

export { setupIframe };
