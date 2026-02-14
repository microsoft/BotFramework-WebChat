/* eslint-disable no-console */
/* eslint-disable no-magic-numbers */

/**
 * This is used for testing purpose only. For production, customer should bring their own MCP fronting web server.
 */

//x/ <reference path="../node_modules/@modelcontextprotocol/ext-apps/dist/src/types.d.ts" />

import type { McpUiResourceCsp } from '@modelcontextprotocol/ext-apps/';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import cors from 'cors';
import express from 'express';
// @ts-expect-error No .d.ts.
import { startMessageChannelServer } from '../vendor/index.js';
// @ts-expect-error No .d.ts.
import { MessagePortClientTransport } from '../vendor/mcp.js';
import buildContentSecurityPolicyHeader from './buildContentSecurityPolicyHeader.js';

const { PORT = 5101 } = process.env;

const app = express();

app.use(cors());

const { port1, port2 } = new MessageChannel();

await startMessageChannelServer(port2);

const client = new Client({
  name: 'MCP web fronting server',
  version: '0.0.0-0'
});

await client.connect(new MessagePortClientTransport(port1));

app.get('/resources/read', async (req, res) => {
  const resourceURI = new URL(req.url).searchParams.get('uri');

  if (!resourceURI) {
    return res.status(400);
  }

  const result = await client.readResource({ uri: resourceURI });

  res.setHeader('Content-Type', 'text/html;profile=mcp-app');
  res.setHeader(
    'Content-Security-Policy',
    buildContentSecurityPolicyHeader((result._meta?.ui as { csp: McpUiResourceCsp } | undefined)?.csp)
  );
  res.send((result.contents[0] as { text: string }).text);
});

app.listen(PORT, () => console.log(`MCP proxy now listening on ${PORT}`));
