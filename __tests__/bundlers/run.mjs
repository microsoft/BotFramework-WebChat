// Builds the Dockerfile here for <folder>/dist/ (Chrome with the app served on port 8000) and opens the app over
// WebDriver: passes when report.js reports that Web Chat shows the bot message without errors, on index.html and, if the
// app has one, on element.html (Web Chat as a custom element).
//
// Usage: node run.mjs <esbuild | vite | webpack4 | webpack5>

import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const TIMEOUT = 60_000;

const app = process.argv[2];
const docker = async (...args) => (await promisify(execFile)('docker', args)).stdout.trim();
const pages = Object.freeze(
  existsSync(new URL(`${app}/dist/element.html`, import.meta.url)) ? ['', 'element.html'] : ['']
);

// Resolves with the first truthy value of getValue(), which is called every 100 ms.
async function poll(getValue, message) {
  const deadline = Date.now() + TIMEOUT;

  for (;;) {
    const value = await getValue();

    if (value) {
      return value;
    } else if (Date.now() > deadline) {
      throw new Error(`${message} in ${TIMEOUT / 1000} seconds.`);
    }

    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

console.time('Built the image');

await docker(
  'build',
  '--build-arg',
  `APP=${app}`,
  '--tag',
  `webchat-bundler-${app}`,
  fileURLToPath(new URL('.', import.meta.url))
);

console.timeEnd('Built the image');

const container = `webchat-bundler-${app}-${process.pid}`;
let removingContainer;
const removeContainer = () => (removingContainer ||= docker('rm', '--force', container));

// Registered before `docker run`, which can be interrupted after it created the container.
['SIGINT', 'SIGTERM'].forEach(signal => process.once(signal, () => removeContainer().finally(() => process.exit(1))));

await docker(
  'run',
  '--detach',
  '--name',
  container,
  '--publish',
  '127.0.0.1::4444',
  '--shm-size=2g',
  `webchat-bundler-${app}`
);

try {
  const webDriverURL = `http://${await docker('port', container, '4444')}/`;

  async function webDriver(method, path, body) {
    const response = await fetch(new URL(path, webDriverURL), {
      body: body && JSON.stringify(body),
      headers: { 'content-type': 'application/json' },
      method,
      signal: AbortSignal.timeout(TIMEOUT)
    });
    const { value } = await response.json();

    if (!response.ok) {
      throw new Error(`WebDriver ${method} /${path}: ${value?.message ?? response.statusText}`);
    }

    return value;
  }

  console.time('WebDriver ready');

  await poll(
    () =>
      webDriver('GET', 'status').then(
        ({ ready }) => ready,
        () => false
      ),
    'WebDriver is not ready'
  );

  console.timeEnd('WebDriver ready');

  const { sessionId } = await webDriver('POST', 'session', {
    capabilities: { alwaysMatch: { browserName: 'chrome' } }
  });

  try {
    // "localhost" is the container, where the Dockerfile serves the app.
    for (const page of pages) {
      console.time(`Rendered /${page}`);

      await webDriver('POST', `session/${sessionId}/url`, { url: `http://localhost:8000/${page}` });

      const { errors, ok } = await poll(
        () =>
          webDriver('POST', `session/${sessionId}/execute/sync`, {
            args: [],
            script: 'return window.bundlerTestResult'
          }),
        `No report from /${page}`
      );

      console.timeEnd(`Rendered /${page}`);
      errors.forEach(error => console.error(error));
      console.log(
        ok
          ? `Web Chat bundled by ${app} rendered the bot message on /${page}.`
          : `Failed to render the ${app} app /${page}.`
      );
      ok || (process.exitCode = 1);
    }
  } finally {
    // Ignore errors here, so they don't replace the error of a session that already ended.
    await webDriver('DELETE', `session/${sessionId}`).catch(() => {});
  }
} finally {
  await removeContainer();
}
