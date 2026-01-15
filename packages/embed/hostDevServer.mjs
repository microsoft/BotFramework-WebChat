import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { join } from 'path';
import { fileURLToPath } from 'url';

const { PORT = 5002 } = process.env;
const DEFAULT_BOT_ID = 'webchat-mockbot';

const app = express();

app.get('/', async (_, res) => {
  const tokenRes = await fetch('https://hawo-mockbot4-token-app.ambitiousflower-67725bfd.westus.azurecontainerapps.io/api/token/directline', { method: 'POST' });

  if (!tokenRes.ok) {
    return res.send(500);
  }

  const { token } = await tokenRes.json();

  const redirectURL = new URL(DEFAULT_BOT_ID, 'http://localhost/embed/');

  redirectURL.searchParams.set('b', DEFAULT_BOT_ID);
  redirectURL.searchParams.set('t', token);

  res.status(302);
  res.header('location', redirectURL.pathname + redirectURL.search);

  return res.end();
});

app.get('/embed/:bot', async (_, res) =>
  res.setHeader('content-type', 'text/html').sendFile(join(fileURLToPath(import.meta.url), '../dist/gemini.html'))
);

app.get('/embed/:bot/config', createProxyMiddleware({ changeOrigin: true, target: 'https://webchat.botframework.com/' }));

app.listen(PORT, () => console.log(`Embed dev server is listening to port ${PORT}`));
