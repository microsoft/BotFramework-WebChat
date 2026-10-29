// Serves <folder>/dist/ with report.js injected before the app's scripts, and opens it in headless Chrome: passes when
// report.js reports that Web Chat shows the bot message without errors.
//
// Usage: node run.mjs <esbuild | vite | webpack4 | webpack5>

import { launch } from 'chrome-launcher';
import { access, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTENT_TYPES = Object.freeze({ '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8' });
const TIMEOUT = 60_000;

const root = fileURLToPath(new URL(`${process.argv[2]}/dist/`, import.meta.url));
const { promise: reported, resolve: report } = Promise.withResolvers();

await access(join(root, 'index.html')); // Fails with the path when the app is not built.

setTimeout(() => report({ errors: [`No report from the page in ${TIMEOUT / 1000} seconds.`] }), TIMEOUT).unref();

const server = createServer(async (request, response) => {
  const { pathname } = new URL(request.url, 'http://localhost');

  if (pathname === '/__runner/report') {
    try {
      report(JSON.parse(Buffer.concat(await Array.fromAsync(request))));
      response.end();
    } catch (error) {
      report({ errors: [`Invalid report from the page: ${error.message}`] });
      response.writeHead(400).end();
    }

    return;
  }

  try {
    const path =
      pathname === '/__runner/report.js'
        ? fileURLToPath(new URL('report.js', import.meta.url))
        : join(root, normalize(pathname).replace(/\/$/u, '/index.html'));
    const body = await readFile(path);

    response
      .writeHead(200, { 'content-type': CONTENT_TYPES[extname(path)] || 'application/octet-stream' })
      .end(
        path.endsWith('.html') ? `${body}`.replace(/<head>/iu, '$&<script src="/__runner/report.js"></script>') : body
      );
  } catch {
    response.writeHead(404).end();
  }
});

await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));

const chrome = await launch({ chromeFlags: ['--headless'], startingUrl: `http://127.0.0.1:${server.address().port}/` });
const { errors, ok } = await reported;

chrome.kill();
server.close();

errors.forEach(error => console.error(error));
console.log(ok ? `Web Chat bundled in ${root} rendered the bot message.` : `Failed to render ${root}.`);
process.exitCode = ok ? 0 : 1;
