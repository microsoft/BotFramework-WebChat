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
      fetch(new URL(`/wd/hub/session/${entry.sessionId}`, WEB_DRIVER_URL), { method: 'DELETE' }).catch(() => {});
    });
}

async function pingSession(sessionId) {
  const res = await fetch(new URL(`/wd/hub/session/${sessionId}/url`, WEB_DRIVER_URL));

  if (!res.ok) {
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
  const res = await fetch(new URL('/wd/hub/status', WEB_DRIVER_URL));

  if (!res.ok) {
    throw new Error('Grid does not respond.');
  }

  const {
    value: { message, ready }
  } = await res.json();

  if (!ready) {
    throw new Error(`Grid does NOT have capacity for new instance: ${message}.`);
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
        entry.numUsed++;

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

        console.log(`New instance ${entry.sessionId} created. Now the pool has ${pool.length} instances.`);

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
        await fetch(new URL(`/wd/hub/session/${entry.sessionId}/url`, WEB_DRIVER_URL), {
          data: JSON.stringify({ url: 'about:blank' }),
          method: 'POST'
        });

        await fetch(new URL(`/wd/hub/session/${entry.sessionId}/window/rect`, WEB_DRIVER_URL), {
          data: JSON.stringify({ height: 360, width: 640 }),
          method: 'POST'
        });

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
