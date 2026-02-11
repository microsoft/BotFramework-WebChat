import { Client } from '@modelcontextprotocol/sdk/client';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import React, { useEffect, useRef } from 'react';
import { never, object, optional, parse, type InferOutput } from 'valibot';
import { loadSandboxProxy, setupIframe } from '../index.js';
import { MCPAppsResourceSchema, MCPAppsResponseEntitySchema, MCPToolWithAppsMetaSchema } from './types';

const MCPAppActivityPropsSchema = object({
  children: optional(never()),
  entity: MCPAppsResponseEntitySchema
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

      const client = new Client({
        name: 'botframework-webchat-mcp-app',
        version: '0.0.0-0'
      });

      await client.connect(
        new StreamableHTTPClientTransport(
          new URL('https://mcp-apps-020426-ctgxdudsfxgebfa8.canadacentral-01.azurewebsites.net/mcp')
        ),
        { signal }
      );

      const { tools } = await client.listTools(undefined, { signal });

      const tool = tools.find(t => t.name === toolName);

      if (!tool) {
        throw new Error(`Cannot find tool named "${toolName}" from tools/list call.`);
      }

      const meta = parse(MCPToolWithAppsMetaSchema, tool._meta);

      const resource = await client.readResource({ uri: meta.ui.resourceUri });

      await loadSandboxProxy(iframeRef.current);

      const firstContent = parse(MCPAppsResourceSchema, resource.contents[0]);

      const { sendToolResult } = await setupIframe(
        iframeRef.current,
        new URL('https://mcp-apps-020426-ctgxdudsfxgebfa8.canadacentral-01.azurewebsites.net/mcp'),
        firstContent.text,
        entity['urn:microsoft:webchat:model-context-protocol:input']
      );

      sendToolResult({
        _meta: {
          viewUUID: 'df4b7c01-6602-4d78-9adf-7b4571c855de',
          weatherData: {
            location: '東京都',
            latitude: 35.6768601,
            longitude: 139.7638947,
            current: {
              temperature: 9.9,
              condition: 'Clear Sky',
              feelsLike: 8,
              humidity: 44,
              windSpeed: 1.1,
              uvIndex: 3.85,
              weatherCode: 0
            },
            forecast: [
              { date: '2026-02-05', tempMax: 11.7, tempMin: 1.2, weatherCode: 2, condition: 'Partly Cloudy' },
              { date: '2026-02-06', tempMax: 13.4, tempMin: 2.2, weatherCode: 1, condition: 'Mainly Clear' },
              { date: '2026-02-07', tempMax: 5.3, tempMin: 1.2, weatherCode: 2, condition: 'Partly Cloudy' },
              { date: '2026-02-08', tempMax: 0.8, tempMin: -1.7, weatherCode: 85, condition: 'Snow Showers' },
              { date: '2026-02-09', tempMax: 6.2, tempMin: -2.8, weatherCode: 0, condition: 'Clear Sky' },
              { date: '2026-02-10', tempMax: 8.1, tempMin: -0.9, weatherCode: 3, condition: 'Overcast' },
              { date: '2026-02-11', tempMax: 16.3, tempMin: 2.3, weatherCode: 61, condition: 'Rain' }
            ]
          }
        },
        content: [{ type: 'text', text: 'Showing weather for 東京都: 9.9°C, Clear Sky' }]
      });
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
