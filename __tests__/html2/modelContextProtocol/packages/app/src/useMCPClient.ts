/* eslint-disable no-console */
import { getToolUiResourceUri, McpUiDisplayMode } from '@modelcontextprotocol/ext-apps/app-bridge';
import { Client } from '@modelcontextprotocol/sdk/client';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { loadSandboxProxy } from '@msinternal/modelcontextprotocol-ext-apps-basic-host/implementation';
import { useEffect, useRef, useState } from 'react';
import { usePostActivity } from 'botframework-webchat/hook';
import { parse, type InferOutput } from 'valibot';
import setupIframe from './setupIframe.js';
import { MCPToolUIResourceSchema } from './types/MCPToolUIResource.js';
import { MessageEntityForMCPAppSchema } from './types/MessageEntityForMCPApp.js';

// @ts-expect-error: TypeScript doesn't support remote import paths
import { startMessageChannelServer } from 'https://cdn.jsdelivr.net/gh/OEvgeny/mcp-map-server-ui@v0.0.3/esm/index.js';
// @ts-expect-error: TypeScript doesn't support remote import paths
import { MessagePortClientTransport } from 'https://cdn.jsdelivr.net/gh/OEvgeny/mcp-map-server-ui@v0.0.3/esm/mcp.js';

const USE_OFFLINE_MCP_SERVER = true;

export function useMCPClient(
  iframe: HTMLIFrameElement | null,
  toolName: string,
  entity: InferOutput<typeof MessageEntityForMCPAppSchema>
) {
  const [uiResource, setUiResource] = useState<InferOutput<typeof MCPToolUIResourceSchema> | null>(null);
  const [mode, setMode] = useState<McpUiDisplayMode>('inline');

  const entityRef = useRef(entity);
  entityRef.current = entity;

  const postActivity = usePostActivity();
  const postActivityRef = useRef(postActivity);
  postActivityRef.current = postActivity;

  useEffect(() => {
    const abortController = new AbortController();

    (async signal => {
      if (!iframe) {
        return;
      }

      const { port1, port2 } = new MessageChannel();

      const client = new Client({
        name: 'botframework-webchat-mcp-app',
        version: '0.0.0-0'
      });

      if (USE_OFFLINE_MCP_SERVER) {
        console.log('Using offline MCP server');

        await startMessageChannelServer(port2);

        await client.connect(new MessagePortClientTransport(port1), { signal });
      } else {
        console.warn('Using online MCP server');

        // StreamableHTTPClientTransport.sessionId is typed as `string | undefined`
        // but the Transport interface requires `string`; cast to satisfy the constraint.
        await client.connect(
          new StreamableHTTPClientTransport(
            new URL('https://mcp-apps-020426-ctgxdudsfxgebfa8.canadacentral-01.azurewebsites.net/mcp')
          ) as StreamableHTTPClientTransport & { sessionId: string },
          { signal }
        );
      }

      const { tools } = await client.listTools(undefined, { signal });

      const tool = tools.find(t => t.name === toolName);

      if (!tool) {
        throw new Error(`Cannot find tool named "${toolName}" from the server`);
      }

      const uri = getToolUiResourceUri(tool);

      if (typeof uri === 'undefined') {
        throw new Error(`Tool "${toolName}" has no UI resources and hence does not support MCP Ext Apps`);
      }

      const resource = await client.readResource({ uri }, { signal });
      const parsedUiResource = parse(MCPToolUIResourceSchema, resource.contents[0]);

      await loadSandboxProxy(iframe, parsedUiResource._meta.ui.csp);

      const appBridge = await setupIframe(
        client,
        iframe,
        parsedUiResource,
        entityRef.current['urn:microsoft:webchat:model-context-protocol:call-tool:input'],
        entityRef.current['urn:microsoft:webchat:model-context-protocol:call-tool:result']
      );

      appBridge.onmessage = async ({ content }) => {
        const text = content
          .filter((block): block is Extract<typeof block, { type: 'text' }> => block.type === 'text')
          .map(block => block.text)
          .join('\n');

        try {
          await new Promise<void>((resolve, reject) => {
            postActivityRef.current({ type: 'message', text } as any).subscribe(() => resolve(), reject);
          });
          return {};
        } catch {
          return { isError: true };
        }
      };

      appBridge.oncalltool = (params, extra) => {
        // eslint-disable-next-line no-magic-numbers
        const args = JSON.stringify(params.arguments, null, 2);
        // eslint-disable-next-line no-alert
        if (!window.confirm(`Allow the app to call tool "${params.name}"?\n\n${args}`)) {
          return Promise.resolve({ isError: true, content: [{ type: 'text', text: 'User denied the tool call.' }] });
        }
        return client.request({ method: 'tools/call', params }, CallToolResultSchema, { signal: extra.signal });
      };

      appBridge.onopenlink = ({ url }) => {
        // eslint-disable-next-line no-alert
        if (!window.confirm(`Open external link?\n\n${url}`)) {
          return Promise.resolve({ isError: true, error: new Error('User cancelled opening the link') });
        }
        window.open(url, '_blank', 'noopener,noreferrer');
        return Promise.resolve({});
      };

      appBridge.onrequestdisplaymode = ({ mode: requested }) =>
        new Promise(resolve => {
          setMode(current => {
            let next = requested;
            // support toggling fullscreen request
            if (requested === 'fullscreen' && current === 'fullscreen') {
              next = 'inline';
            }
            resolve({ mode: next });
            return next;
          });
        });

      setUiResource(parsedUiResource);
    })(abortController.signal);

    return () => abortController.abort();
  }, [iframe, toolName]); // entity is accessed via entityRef to avoid re-instantiation on every render

  return { mode, uiResource };
}
