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

function timeLeft({ startTime }) {
  return INSTANCE_LIFE - Date.now() + startTime;
}

async function housekeep() {
  let entry;

  while (
    (entry = pool.find(entry => !entry.busy && (entry.numUsed >= NUM_RECYCLE || timeLeft(entry) < INSTANCE_MIN_LIFE)))
  ) {
    console.log(`Instance ${entry.session.value.sessionId} maximum usage is up, terminating.`);

    entry.busy = true;

    await fetch(new URL(`/wd/hub/session/${entry.session.value.sessionId}`, WEB_DRIVER_URL), { method: 'DELETE' });

    removeInline(pool, entry);
  }
}

app.post(
  '/wd/hub/session',
  async (_, res, next) => {
    await housekeep();

    const entry = pool.find(
      entry => !entry.busy && entry.numUsed < NUM_RECYCLE && timeLeft(entry) >= INSTANCE_MIN_LIFE
    );

    if (entry) {
      console.log(`Reusing instance ${entry.session.value.sessionId}.`);
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

      const entry = { busy: true, numUsed: 1, session, startTime: Date.now() };

      console.log(`New instance ${entry.session.value.sessionId} created.`);

      pool.push(entry);

      setTimeout(housekeep, INSTANCE_LIFE - INSTANCE_MIN_LIFE);

      return responseBuffer;
    }),
    selfHandleResponse: true,
    target: WEB_DRIVER_URL
  })
);

app.delete('/wd/hub/session/:sessionId', async (req, res) => {
  const entry = pool.find(entry => entry.session.value.sessionId === req.params.sessionId);

  if (entry) {
    entry.busy = false;
  }

  await housekeep();

  if (pool.includes(entry)) {
    console.log(`Putting instance ${entry.session.value.sessionId} back to the pool.`);
  }

  res.status(200).end();
});

app.use('/', createProxyMiddleware({ changeOrigin: true, target: WEB_DRIVER_URL }));
app.listen(4444);
