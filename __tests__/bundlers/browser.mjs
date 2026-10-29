// Serves dist/ and loads it in headless Chrome over the DevTools protocol: Web Chat must render the bot message
// without uncaught errors, console errors, or failed requests.
//
// Usage: node browser.mjs, with $CHROME (default: google-chrome, preinstalled on GitHub-hosted Ubuntu runners).

import { spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { dirname, extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TIMEOUT = 60_000;

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, 'dist');
const errors = [];

const CONTENT_TYPES = Object.freeze({
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.mjs': 'text/javascript',
  '.svg': 'image/svg+xml'
});

const server = createServer(async ({ url }, res) => {
  const path = join(root, normalize(new URL(url, 'http://localhost').pathname.replace(/\/$/u, '/index.html')));

  try {
    const body = await readFile(path);

    res.writeHead(200, { 'content-type': CONTENT_TYPES[extname(path)] || 'application/octet-stream' }).end(body);
  } catch {
    res.writeHead(404).end();
  }
});

await new Promise(resolvePromise => server.listen(0, '127.0.0.1', resolvePromise));

const pageURL = `http://127.0.0.1:${server.address().port}/`;

const chrome = spawn(
  process.env.CHROME || 'google-chrome',
  [
    '--headless=new',
    '--no-first-run',
    '--no-default-browser-check',
    // The page is our own bundle, and runners may not allow the user namespaces the sandbox needs.
    '--no-sandbox',
    '--remote-debugging-port=0',
    // A new profile in the app directory, which test.sh creates for each run.
    `--user-data-dir=${resolve(here, '.chrome')}`,
    'about:blank'
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] }
);

const browserURL = await new Promise((resolvePromise, reject) => {
  let stderr = '';

  chrome.once('error', reject);
  chrome.once('exit', code => reject(new Error(`Chrome exited with code ${code}.\n${stderr}`)));
  chrome.stderr.on('data', chunk => {
    stderr += chunk;

    const match = /DevTools listening on (ws:\S+)/u.exec(stderr);

    match && resolvePromise(match[1]);
  });
});

const socket = new WebSocket(browserURL);
const pending = new Map();
const listeners = [];
let lastId = 0;

socket.addEventListener('message', ({ data }) => {
  const message = JSON.parse(data);

  if (message.id) {
    const { reject, resolve: resolvePromise } = pending.get(message.id);

    pending.delete(message.id);
    message.error ? reject(new Error(JSON.stringify(message.error))) : resolvePromise(message.result);
  } else {
    listeners.forEach(listener => listener(message));
  }
});

await new Promise((resolvePromise, reject) => {
  socket.addEventListener('open', resolvePromise, { once: true });
  socket.addEventListener('error', reject, { once: true });
});

const send = (method, params = {}, sessionId) =>
  new Promise((resolvePromise, reject) => {
    const id = ++lastId;

    pending.set(id, { reject, resolve: resolvePromise });
    socket.send(JSON.stringify({ id, method, params, sessionId }));
  });

const requestURLs = new Map();

listeners.push(({ method, params }) => {
  if (method === 'Runtime.exceptionThrown') {
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

const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId } = await send('Target.attachToTarget', { flatten: true, targetId });

await Promise.all(['Network.enable', 'Runtime.enable'].map(method => send(method, {}, sessionId)));
await send('Page.navigate', { url: pageURL }, sessionId);

// Rendered: the transcript shows the message from the fake chat adapter in src/app.js, and the send box is there.
const RENDERED = `document.readyState === 'complete' &&
  !!document.querySelector('[role="feed"]')?.textContent.includes('Hello from the bot.') &&
  !!document.querySelector('textarea')`;

let rendered = false;

for (const startTime = Date.now(); !rendered && !errors.length && Date.now() - startTime < TIMEOUT; ) {
  const { result } = await send('Runtime.evaluate', { expression: RENDERED, returnByValue: true }, sessionId);

  rendered = result.value === true;
  rendered || (await new Promise(resolvePromise => setTimeout(resolvePromise, 100)));
}

rendered || errors.length || errors.push(`Web Chat did not render the bot message in ${TIMEOUT / 1000} seconds.`);

socket.close();
chrome.removeAllListeners('exit');

await new Promise(resolvePromise => chrome.once('exit', resolvePromise).kill());

server.close();

// Multi-line messages need "%0A" in GitHub Actions annotations.
errors.forEach(error => console.log(`::error::${error.replace(/\n/gu, '%0A')}`));

console.log(errors.length ? `${errors.length} error(s).` : 'Rendered Web Chat in Chrome, with the bot message.');

process.exit(errors.length ? 1 : 0);
