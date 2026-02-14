/* eslint-disable no-console */
import { getToolUiResourceUri } from '@modelcontextprotocol/ext-apps/app-bridge';
import { Client } from '@modelcontextprotocol/sdk/client';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { loadSandboxProxy } from '@msinternal/modelcontextprotocol-ext-apps-basic-host/implementation';
import React, { useEffect, useRef } from 'react';
import { never, object, optional, parse, type InferOutput } from 'valibot';
import setupIframe from './setupIframe.js';
import { MCPToolUIResourceSchema } from './types/MCPToolUIResource.js';
import { MessageEntityForMCPAppSchema } from './types/MessageEntityForMCPApp.js';
import { startMessageChannelServer } from 'https://cdn.jsdelivr.net/gh/OEvgeny/mcp-map-server-ui@v0.0.2/esm/index.js';
import { MessagePortClientTransport } from 'https://cdn.jsdelivr.net/gh/OEvgeny/mcp-map-server-ui@v0.0.2/esm/mcp.js';

const USE_OFFLINE_MCP_SERVER = true;

const MCPAppActivityPropsSchema = object({
  children: optional(never()),
  entity: MessageEntityForMCPAppSchema
});

type MCPAppActivityProps = { children?: never } & InferOutput<typeof MCPAppActivityPropsSchema>;

const MCPAppActivity = (props: MCPAppActivityProps) => {
  const { entity } = parse(MCPAppActivityPropsSchema, props);
  const toolName = entity.isPartOf[0]!.name;

  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const abortController = new AbortController();

    (async signal => {
      if (!iframeRef.current) {
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
          } as StreamableHTTPClientTransport & { sessionId: string }, // Fixing type issues in @modelcontextprotocol/ext-apps
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

      await loadSandboxProxy(iframeRef.current, uiResource._meta.ui.csp);

      await setupIframe(
        client,
        iframeRef.current,
        uiResource,
        entity['urn:microsoft:webchat:model-context-protocol:call-tool:input'],
        entity['urn:microsoft:webchat:model-context-protocol:call-tool:result']
      );
    })(abortController.signal);

    return () => abortController.abort();
  }, [iframeRef]);

  return (
    <div>
      <h1>MCP App</h1>
      <iframe ref={iframeRef} style={{ height: 480 }} />
    </div>
  );
};

export default MCPAppActivity;
export { MCPAppActivityPropsSchema };
export type { MCPAppActivityProps };
