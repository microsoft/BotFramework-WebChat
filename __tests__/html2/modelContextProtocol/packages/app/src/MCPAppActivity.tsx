/* eslint-disable no-console */
import { getToolUiResourceUri, McpUiDisplayMode } from '@modelcontextprotocol/ext-apps/app-bridge';
import { Client } from '@modelcontextprotocol/sdk/client';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { loadSandboxProxy } from '@msinternal/modelcontextprotocol-ext-apps-basic-host/implementation';
import React, { ReactNode, useEffect, useState } from 'react';
import { never, object, optional, parse, type InferOutput } from 'valibot';
import setupIframe from './setupIframe.js';
import { MCPToolUIResourceSchema } from './types/MCPToolUIResource.js';
import { MessageEntityForMCPAppSchema } from './types/MessageEntityForMCPApp.js';
import { startMessageChannelServer } from 'https://cdn.jsdelivr.net/gh/OEvgeny/mcp-map-server-ui@v0.0.3/esm/index.js';
import { MessagePortClientTransport } from 'https://cdn.jsdelivr.net/gh/OEvgeny/mcp-map-server-ui@v0.0.3/esm/mcp.js';

const USE_OFFLINE_MCP_SERVER = true;

const MCPAppActivityPropsSchema = object({
  children: optional(never()),
  entity: MessageEntityForMCPAppSchema
});
type MCPAppActivityProps = { children?: never } & InferOutput<typeof MCPAppActivityPropsSchema>;

function MCPAppShell(props: { mode: McpUiDisplayMode; children?: ReactNode }) {
  const { children, mode } = props;

  return (
    <div>
      <div>
        <h1>MCP App</h1>
      </div>

      <div
        {...(mode === 'fullscreen' && {
          role: 'dialog',
          'aria-modal': 'true',
          style: {
            position: 'fixed',
            inset: 0,
            zIndex: 2147483646,
            background: 'rgba(0,0,0,0.55)'
          }
        })}
      >
        {children}
      </div>
    </div>
  );
}

const sharedIframeStyle: Map<McpUiDisplayMode, React.CSSProperties> = new Map([
  [
    'inline',
    {
      display: 'block',
      border: 'none',
      background: 'transparent',
      width: '100%',
      height: 400
    }
  ],
  [
    'fullscreen',
    {
      display: 'block',
      border: 'none',
      background: 'transparent',
      position: 'fixed',
      inset: 0,
      width: '100%',
      height: '100%'
    }
  ]
]);

const MCPAppActivity = (props: MCPAppActivityProps) => {
  const { entity } = parse(MCPAppActivityPropsSchema, props);
  const [iframe, setIframe] = useState<HTMLIFrameElement | null>(null);
  const [mode, setMode] = useState<McpUiDisplayMode>('inline');

  const toolName = entity.isPartOf[0]!.name;

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

        await client.connect(
          new StreamableHTTPClientTransport(
            new URL('https://mcp-apps-020426-ctgxdudsfxgebfa8.canadacentral-01.azurewebsites.net/mcp')
          ) satisfies StreamableHTTPClientTransport & {
            sessionId: string | undefined;
          } as StreamableHTTPClientTransport & {
            sessionId: string;
          },
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
      const uiResource = parse(MCPToolUIResourceSchema, resource.contents[0]);

      await loadSandboxProxy(iframe, uiResource._meta.ui.csp);

      const appBridge = await setupIframe(
        client,
        iframe,
        uiResource,
        entity['urn:microsoft:webchat:model-context-protocol:call-tool:input'],
        entity['urn:microsoft:webchat:model-context-protocol:call-tool:result']
      );

      appBridge.onopenlink = () => console.log('do something');

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
    })(abortController.signal);

    return () => abortController.abort();
  }, [iframe, toolName]);

  return (
    <MCPAppShell mode={mode}>
      <iframe key={toolName} ref={setIframe} title="MCP App" style={sharedIframeStyle.get(mode)} />
    </MCPAppShell>
  );
};

export default MCPAppActivity;
export { MCPAppActivityPropsSchema };
export type { MCPAppActivityProps };
