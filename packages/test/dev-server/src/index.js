import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import chalk from 'chalk';
import compression from 'compression';
import express from 'express';
import serve from 'serve-handler';

const { ESBUILD_TARGET = 'http://127.0.0.1:8000/', PORT = 5001 } = process.env;
const resolveFromProjectRoot = resolve.bind(undefined, fileURLToPath(import.meta.url), '../../');
const resolveFromRepositoryRoot = resolveFromProjectRoot.bind(undefined, '../../../');

(async function () {
  const app = express();
  const serveConfigJSON = JSON.parse(await readFile(resolveFromRepositoryRoot('./serve-test.json'), 'utf8'));

  // Hide all dot files.
  app.use((req, res, next) => (/\/\./u.test(req.url) ? res.status(404).end() : next()));

  // Using compression will serve files faster from GitHub Codespaces, from 500ms to 200ms.
  app.use(compression());

  // /__dist__/ will be serve from ESBuild development server.
  app.use(
    '/__dist__/',
    createProxyMiddleware({
      changeOrigin: true,
      logLevel: 'warn',
      pathRewrite: { '^\\/__dist__\\/': '/' },
      onProxyReq(_proxyReq, _req, res) {
        res.setHeader('x-request-time', new Date().toISOString());
      },
      onProxyRes(_, req, res) {
        const duration = Date.now() - new Date(res.getHeader('x-request-time'));
        const durationString = `(${duration} ms)`;

        console.log(
          `${req.url} ${
            duration < 1000
              ? chalk.greenBright(durationString)
              : duration < 2000
              ? chalk.yellowBright(durationString)
              : chalk.redBright(durationString)
          }`
        );

        res.removeHeader('x-request-time');
      },
      target: ESBUILD_TARGET
    })
  );

  // Other requests will be served by `serve-handler` based on `/serve-test.json`.
  app.use((req, res) => serve(req, res, { ...serveConfigJSON, public: resolveFromRepositoryRoot() }));

  app.listen(PORT, () => console.log(`Web Chat development server listening on port ${PORT}`));
})();
