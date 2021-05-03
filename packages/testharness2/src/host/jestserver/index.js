require('global-agent/bootstrap');

const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const express = require('express');
const fetch = require('node-fetch');
const removeInline = require('./removeInline');

const INSTANCE_LIFE = 30000 * 10; // Instance can live up to 5 minutes.
const INSTANCE_MIN_LIFE = 30000; // The instance must have at least 30 seconds left, otherwise, we should recycle it as we don't have much time left.
const NUM_RECYCLE = 5; // We will reuse the instance only 5 times.
const WEB_DRIVER_URL = 'http://selenium-hub:4444/';

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

function housekeep(pool) {
  pool
    .filter(entry => entry.error || (!entry.busy && (!runLeft(entry) || timeLeft(entry) < INSTANCE_MIN_LIFE)))
    .forEach(entry => {
      removeInline(pool, entry);

      console.log(
        `Instance ${entry.sessionId} is being terminated with ${~~(timeLeft(entry) / 1000)} seconds and ${runLeft(
          entry
        )} runs left.`
      );

      // Ignore errors for terminating the session, it is already taken out of the pool.
      sendWebDriverCommand(entry.sessionId, undefined, undefined, { method: 'DELETE' }).catch(err => console.log(err));
    });
}

async function pingSession(sessionId) {
  try {
    await sendWebDriverCommand(sessionId, 'url');
  } catch (err) {
    console.log(
      `Instance ${entry.sessionId} does not respond, taking out of the pool, with ${~~(
        timeLeft(entry) / 1000
      )} seconds and ${runLeft(entry)} runs left.`
    );

    entry.error = true;

    throw new Error('Session failed to response to ping.');
  }
}

async function checkGridCapacity() {
  try {
    const {
      value: { message, ready }
    } = await sendWebDriverCommand(undefined, 'status');

    if (!ready) {
      throw new Error(`Grid does NOT have capacity for new instance: ${message}.`);
    }
  } catch (err) {
    throw new Error(`Grid does not respond: ${err.message}`);
  }
}

(async function () {
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
          await pingSession(entry.sessionId);
        } catch (err) {
          entry.error = new Error('Failed to acquire session.');
        }

        console.log(
          `Acquiring instance ${entry.sessionId}, with ${~~(timeLeft(entry) / 1000)} seconds and ${runLeft(
            entry
          )} runs left.`
        );

        entry.numUsed++;

        return res.send(entry.session);
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
        // The instance is being released back into the pool, we need to clean it up.
        await sendWebDriverCommand(entry.sessionId, 'url', { url: 'about:blank' });
        await sendWebDriverCommand(entry.sessionId, 'window/rect', { height: 360, width: 640 });

        console.log(
          `Releasing instance ${entry.sessionId} back to the pool, with ${~~(
            timeLeft(entry) / 1000
          )} seconds and ${runLeft(entry)} runs left.`
        );
      }

      return res.status(200).end();
    }

    res.status(404).end();
  });

  app.use('/', createProxyMiddleware(DEFAULT_PROXY_OPTIONS));
  app.listen(4444);

  setInterval(() => housekeep(pool), 5000);

  process.on('SIGTERM', async () => {
    pool.forEach(entry => {
      entry.error = true;
    });

    housekeep(pool);

    await new Promise(resolve => setTimeout(resolve, 1000));

    process.exit(0);
  });
})();

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

  return await res.json();
}
