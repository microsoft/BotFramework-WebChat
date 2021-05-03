const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const express = require('express');
const fetch = require('node-fetch');
const removeInline = require('./removeInline');

const INSTANCE_LIFE = 30000 * 10; // Instance can live up to 5 minutes.
const INSTANCE_MIN_LIFE = 30000; // The instance must have at least 30 seconds left, otherwise, we should recycle it as we don't have much time left.
const NUM_RECYCLE = 5; // We will reuse the instance only 5 times.
const WEB_DRIVER_URL = 'http://selenium-hub:4444/';

const app = express();
const pool = [];

function runLeft({ numUsed }) {
  return Math.max(0, NUM_RECYCLE - numUsed);
}

function timeLeft({ startTime }) {
  return INSTANCE_LIFE - Date.now() + startTime;
}

async function housekeep() {
  const entriesToHousekeep = pool.filter(
    entry => !entry.busy && (!runLeft(entry) || timeLeft(entry) < INSTANCE_MIN_LIFE)
  );

  await Promise.all(
    entriesToHousekeep.map(entry =>
      (async () => {
        removeInline(pool, entry);

        console.log(
          `Instance ${entry.sessionId} maximum usage is up, terminating. ${~~(
            timeLeft(entry) / 1000
          )} seconds and ${runLeft(entry)} runs left.`
        );

        try {
          await fetch(new URL(`/wd/hub/session/${entry.sessionId}`, WEB_DRIVER_URL), { method: 'DELETE' });
        } catch (err) {
          console.error(err);
        }
      })()
    )
  );
}

app.post(
  '/wd/hub/session',
  async (_, res, next) => {
    await housekeep();

    const entry = pool.find(entry => !entry.busy && runLeft(entry) && timeLeft(entry) >= INSTANCE_MIN_LIFE);

    if (entry) {
      console.log(
        `Acquiring instance ${entry.sessionId}, ${~~(timeLeft(entry) / 1000)} seconds and ${runLeft(entry)} runs left.`
      );
      entry.busy = true;
      entry.numUsed++;

      return res.send(entry.session);
    }

    next();
  },
  createProxyMiddleware({
    changeOrigin: true,
    onProxyRes: responseInterceptor(async responseBuffer => {
      const session = JSON.parse(responseBuffer.toString());

      const entry = { busy: true, numUsed: 1, session, sessionId: session.value.sessionId, startTime: Date.now() };

      pool.push(entry);

      setTimeout(housekeep, INSTANCE_LIFE - INSTANCE_MIN_LIFE);

      console.log(`New instance ${entry.sessionId} created.`);

      return responseBuffer;
    }),
    selfHandleResponse: true,
    target: WEB_DRIVER_URL
  })
);

app.delete('/wd/hub/session/:sessionId', async (req, res) => {
  const entry = pool.find(entry => entry.sessionId === req.params.sessionId);

  if (entry) {
    entry.busy = false;

    await housekeep();

    if (pool.includes(entry)) {
      console.log(
        `Releasing instance ${entry.sessionId} back to the pool, ${~~(timeLeft(entry) / 1000)} seconds and ${runLeft(
          entry
        )} runs left.`
      );
    }

    return res.status(200).end();
  }

  res.status(404).end();
});

app.use('/', createProxyMiddleware({ changeOrigin: true, target: WEB_DRIVER_URL }));
app.listen(4444);
