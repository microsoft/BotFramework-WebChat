// Serves dist/ and loads it in headless Chrome over the DevTools protocol: Web Chat must render the bot message
// without uncaught errors, console errors, or failed requests.
//
// Usage: node browser.mjs, with $CHROME (default: google-chrome, preinstalled on GitHub-hosted Ubuntu runners).

import { spawn } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Well under the job's timeout-minutes, which also covers npm install and bundling.
const CDP_TIMEOUT = 10_000;
const CHROME_START_TIMEOUT = 30_000;
const RENDER_TIMEOUT = 60_000;
const TOTAL_TIMEOUT = 120_000;

const CONTENT_TYPES = Object.freeze({
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.mjs': 'text/javascript',
  '.svg': 'image/svg+xml'
});

// Rendered: the transcript shows the message from the fake chat adapter in src/app.js, and the send box is there.
const RENDERED = `document.readyState === 'complete' &&
  !!document.querySelector('[role="feed"]')?.textContent.includes('Hello from the bot.') &&
  !!document.querySelector('textarea')`;

const errors = [];
const profileDir = mkdtempSync(join(tmpdir(), 'webchat-bundler-test-'));
const root = resolve(dirname(fileURLToPath(import.meta.url)), 'dist');

function withTimeout(promise, timeout, message) {
  let timer;

  return Promise.race([
    promise,
    new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(message)), timeout);
    })
  ]).finally(() => clearTimeout(timer));
}

const server = createServer(async ({ url }, res) => {
  const path = join(root, normalize(new URL(url, 'http://localhost').pathname.replace(/\/$/u, '/index.html')));

  try {
    const body = await readFile(path);

    res.writeHead(200, { 'content-type': CONTENT_TYPES[extname(path)] || 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end();
  }
});

const chrome = spawn(
  process.env.CHROME || 'google-chrome',
  [
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    // The page only loads our own bundle, on an ephemeral CI runner, so we do not depend on the runner allowing the sandbox.
    '--no-sandbox',
    '--remote-debugging-port=0',
    `--user-data-dir=${profileDir}`,
    'about:blank'
  ],
  // In its own process group, so the cleanup below also kills its renderer and GPU processes.
  { detached: true, stdio: ['ignore', 'ignore', 'pipe'] }
);

const chromeExited = new Promise(resolvePromise => chrome.once('error', resolvePromise).once('exit', resolvePromise));

// Never leaves Chrome or its profile behind, also when the script throws, times out, or is interrupted.
function killChrome(signal) {
  try {
    process.kill(-chrome.pid, signal);
  } catch {
    // Already exited, or never started.
  }
}

process.once('exit', () => {
  killChrome('SIGKILL');
  rmSync(profileDir, { force: true, maxRetries: 5, recursive: true });
});

['SIGINT', 'SIGTERM'].forEach(signal => process.once(signal, () => process.exit(1)));

async function run() {
  await new Promise(resolvePromise => server.listen(0, '127.0.0.1', resolvePromise));

  const browserURL = await withTimeout(
    new Promise((resolvePromise, reject) => {
      let stderr = '';

      chrome.once('error', reject);
      chromeExited.then(code => reject(new Error(`Chrome exited with code ${code}.\n${stderr}`)));
      chrome.stderr.on('data', chunk => {
        stderr += chunk;

        const match = /DevTools listening on (ws:\S+)/u.exec(stderr);

        match && resolvePromise(match[1]);
      });
    }),
    CHROME_START_TIMEOUT,
    `Chrome did not open its DevTools endpoint in ${CHROME_START_TIMEOUT / 1000} seconds.`
  );

  const socket = new WebSocket(browserURL);
  const pending = new Map();
  const requestURLs = new Map();
  let lastId = 0;

  socket.addEventListener('message', ({ data }) => {
    const { error, id, method, params, result } = JSON.parse(data);

    if (id) {
      const { reject, resolve: resolvePromise } = pending.get(id);

      pending.delete(id);
      error ? reject(new Error(JSON.stringify(error))) : resolvePromise(result);
    } else if (method === 'Runtime.exceptionThrown') {
      const { exception, text } = params.exceptionDetails;

      errors.push(`Uncaught: ${exception?.description || text}`);
    } else if (method === 'Runtime.consoleAPICalled' && (params.type === 'assert' || params.type === 'error')) {
      errors.push(`console.${params.type}: ${params.args.map(arg => arg.value ?? arg.description).join(' ')}`);
    } else if (method === 'Network.requestWillBeSent') {
      requestURLs.set(params.requestId, params.request.url);
    } else if (method === 'Network.loadingFailed') {
      errors.push(`Request failed: ${requestURLs.get(params.requestId)} ${params.errorText}`);
    } else if (method === 'Network.responseReceived' && params.response.status >= 400) {
      errors.push(`HTTP ${params.response.status}: ${params.response.url}`);
    }
  });

  await withTimeout(
    new Promise((resolvePromise, reject) => {
      socket.addEventListener('open', resolvePromise, { once: true });
      socket.addEventListener('error', reject, { once: true });
    }),
    CDP_TIMEOUT,
    `Could not connect to Chrome DevTools in ${CDP_TIMEOUT / 1000} seconds.`
  );

  const send = (method, params = {}, sessionId) =>
    withTimeout(
      new Promise((resolvePromise, reject) => {
        const id = ++lastId;

        pending.set(id, { reject, resolve: resolvePromise });
        socket.send(JSON.stringify({ id, method, params, sessionId }));
      }),
      CDP_TIMEOUT,
      `Chrome did not answer ${method} in ${CDP_TIMEOUT / 1000} seconds.`
    );

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await send('Target.attachToTarget', { flatten: true, targetId });

  await Promise.all(['Network.enable', 'Runtime.enable'].map(method => send(method, {}, sessionId)));
  await send('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/` }, sessionId);

  let rendered = false;

  for (const startTime = Date.now(); !rendered && !errors.length && Date.now() - startTime < RENDER_TIMEOUT; ) {
    const { result } = await send('Runtime.evaluate', { expression: RENDERED, returnByValue: true }, sessionId);

    rendered = result.value === true;
    rendered || (await new Promise(resolvePromise => setTimeout(resolvePromise, 100)));
  }

  rendered ||
    errors.length ||
    errors.push(`Web Chat did not render the bot message in ${RENDER_TIMEOUT / 1000} seconds.`);

  socket.close();
}

try {
  await withTimeout(run(), TOTAL_TIMEOUT, `browser.mjs did not finish in ${TOTAL_TIMEOUT / 1000} seconds.`);
} catch (error) {
  errors.push(error.message);
} finally {
  server.close();
  server.closeAllConnections();

  // SIGTERM lets Chrome remove its own temporary files. The profile is removed on exit, after Chrome stopped writing to it.
  killChrome('SIGTERM');
  await withTimeout(chromeExited, CDP_TIMEOUT, 'Chrome did not exit.').catch(error => errors.push(error.message));
}

// Multi-line messages need "%0A" in GitHub Actions annotations.
errors.forEach(error => console.log(`::error::${error.replace(/\n/gu, '%0A')}`));

console.log(errors.length ? `${errors.length} error(s).` : 'Rendered Web Chat in Chrome, with the bot message.');

process.exit(errors.length ? 1 : 0);
