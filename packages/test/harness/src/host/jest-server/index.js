/* eslint no-magic-numbers: "off" */

// This is a proxy server for Web Driver to help pooling sessions.
// Instead of creating/deleting sessions, this proxy server will preserve the session in-between, up to a limit (5 runs or 3 mins).
// Since Web Chat is uniform on capabilities (e.g. window size, etc), this implementation works for Web Chat.
// API reference: https://www.w3.org/TR/webdriver1/

require('global-agent/bootstrap');

const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const express = require('express');
const fetch = require('node-fetch');
const removeInline = require('./removeInline');
const sleep = require('../../common/utils/sleep');

const INSTANCE_LIFE = 30000 * 10; // Instance can live up to 5 minutes.
const INSTANCE_MIN_LIFE = 30000; // The instance must have at least 30 seconds left, otherwise, we should recycle it as we don't have much time left.
const NUM_RECYCLE = 5; // We will reuse the instance only 5 times.
const PORT = 4445;
const WEB_DRIVER_URL = process.argv[2] || 'http://selenium-hub:4444/';

const DEFAULT_PROXY_OPTIONS = {
  changeOrigin: true,
  target: WEB_DRIVER_URL
};

function runLeft({ numUsed }) {
  return Math.max(0, NUM_RECYCLE - numUsed);
}

function timeLeft({ startTime }) {
  return Math.max(0, INSTANCE_LIFE - Date.now() + startTime);
}

async function sendWebDriverCommand(sessionId, command, body, fetchOptions) {
  const url = sessionId
    ? command
      ? new URL(`/wd/hub/session/${sessionId}/${command}`, WEB_DRIVER_URL)
      : new URL(`/wd/hub/session/${sessionId}`, WEB_DRIVER_URL)
    : command
    ? new URL(`/wd/hub/${command}`, WEB_DRIVER_URL)
    : new URL(`/wd/hub`, WEB_DRIVER_URL);

  const res = await fetch(
    url,
    body
      ? {
          ...fetchOptions,
          body: JSON.stringify(body),
          headers: {
            accept: 'application/json',
            contentType: 'application/json'
          },
          method: 'POST'
        }
      : fetchOptions || {}
  );

  if (!res.ok) {
    throw new Error(`Failed to send command "${command}": ${(await res.json()).value.message}`);
  }

  return res.json();
}

function housekeep(pool) {
  const entriesToRemove = pool.filter(
    entry => entry.error || (!entry.busy && (!runLeft(entry) || timeLeft(entry) < INSTANCE_MIN_LIFE))
  );

  entriesToRemove.forEach(entry => removeInline(pool, entry));

  return Promise.all(
    entriesToRemove.map(async entry => {
      console.log(
        `Instance ${entry.sessionId} is being terminated with ${~~(timeLeft(entry) / 1000)} seconds and ${runLeft(
          entry
        )} runs left.`
      );

      try {
        // We need to wait for the DELETE command to complete, otherwise, the next test may run too fast and the grid will run out of capacity temporally.
        await sendWebDriverCommand(entry.sessionId, undefined, undefined, { method: 'DELETE' });
      } catch (err) {
        // Ignore errors for terminating the session; it is already taken out of the pool.
      }
    })
  );
}

async function checkGridCapacity() {
  // We will wait for up to 2 seconds for the grid to come back with capacity.
  const MAX_WAIT_FOR_CAPACITY = 2000;

  let message;
  let ready;

  for (const start = Date.now(); Date.now() - start < MAX_WAIT_FOR_CAPACITY; ) {
    try {
      // This is a process loop and intentionally await inside loops.
      // eslint-disable-next-line no-await-in-loop
      const { value } = await sendWebDriverCommand(undefined, 'status');

      ({ message, ready } = value);

      if (ready) {
        break;
      }
    } catch (err) {
      throw new Error(`Grid does not respond: ${err.message}`);
    }

    // This is a process loop and intentionally await inside loops.
    // eslint-disable-next-line no-await-in-loop
    await sleep(100);
  }

  if (!ready) {
    throw new Error(`Grid does not have capacity for new instance: ${message}.`);
  }
}

async function prepareSession(sessionId) {
  // The instance is being released back into the pool, we need to clean it up.

  // If subsequent test is loading the same URL but different hash, it may not work.
  await sendWebDriverCommand(sessionId, 'url', { url: 'about:blank' });

  // It may have set a different window size.
  await sendWebDriverCommand(sessionId, 'window/rect', { height: 640, width: 360 });

  // Last test may have moved the mouse cursor.
  await sendWebDriverCommand(sessionId, 'actions', {
    actions: [
      {
        actions: [{ type: 'pointerMove', origin: 'viewport', duration: 100, x: 0, y: 0 }],
        parameters: { pointerType: 'mouse' },
        type: 'pointer',
        id: 'default mouse'
      }
    ]
  });
}

(function () {
  const app = express();
  const pool = [];

  app.post(
    '/wd/hub/session',
    async (_, res, next) => {
      await housekeep(pool);

      const entry = pool.find(
        entry => !entry.busy && !entry.error && runLeft(entry) && timeLeft(entry) >= INSTANCE_MIN_LIFE
      );

      if (entry) {
        entry.busy = true;

        try {
          await prepareSession(entry.sessionId);
        } catch (err) {
          entry.error = new Error('Failed to prepare session.');
        }

        if (!entry.error) {
          console.log(
            `Acquiring instance ${entry.sessionId}, with ${~~(timeLeft(entry) / 1000)} seconds and ${runLeft(
              entry
            )} runs left.`
          );

          entry.numUsed++;

          // TODO: If it was allocated for more than 30s, kill it.

          return res.send(entry.session);
        }
      }

      // Check if the grid has capacity.

      try {
        await checkGridCapacity();
      } catch (err) {
        console.log(err.message);

        return res.status(500).end(err.message);
      }

      next();
    },
    createProxyMiddleware({
      ...DEFAULT_PROXY_OPTIONS,
      onProxyRes: responseInterceptor(async responseBuffer => {
        const session = JSON.parse(responseBuffer.toString());

        const entry = { busy: true, numUsed: 1, session, sessionId: session.value.sessionId, startTime: Date.now() };

        pool.push(entry);

        setTimeout(() => housekeep(pool), INSTANCE_LIFE - INSTANCE_MIN_LIFE);

        await prepareSession(entry.sessionId);

        console.log(
          `New instance ${entry.sessionId} created. Now the pool has ${pool.length} instances: [${pool
            .map(runLeft)
            .join(', ')}].`
        );

        return responseBuffer;
      }),
      selfHandleResponse: true
    })
  );

  app.delete('/wd/hub/session/:sessionId', async (req, res) => {
    const entry = pool.find(entry => entry.sessionId === req.params.sessionId);

    if (entry) {
      entry.busy = false;

      await housekeep(pool);

      if (pool.includes(entry)) {
        console.log(
          `Releasing instance ${entry.sessionId} back to the pool, with ${~~(
            timeLeft(entry) / 1000
          )} seconds and ${runLeft(entry)} runs left.`
        );
      }

      return res.status(200).end(JSON.stringify({ value: null }));
    }

    res.status(404).end();
  });

  app.use('/', createProxyMiddleware(DEFAULT_PROXY_OPTIONS));
  app.listen(PORT);

  setInterval(() => housekeep(pool), 5000);

  const terminate = async () => {
    pool.forEach(entry => {
      entry.error = true;
    });

    await housekeep(pool);

    // eslint-disable-next-line no-process-exit
    process.exit(0);
  };

  process.once('SIGINT', terminate);
  process.once('SIGTERM', terminate);
})();
