const { createProxyMiddleware, responseInterceptor } = require('http-proxy-middleware');
const express = require('express');
const removeInline = require('./removeInline');

const INSTANCE_LIFE = 30000 * 10; // Instance can live up to 5 minutes.
const INSTANCE_MIN_LIFE = 30000; // The instance must have at least 30 seconds left, otherwise, we should recycle it as we don't have much time left.
const NUM_RECYCLE = 5; // We will reuse the instance only 5 times.
const WEB_DRIVER_URL = 'http://selenium-hub:4444/';

const app = express();
const pool = [];
const proxy = createProxyMiddleware({ changeOrigin: true, target: WEB_DRIVER_URL });

app.post(
  '/wd/hub/session',
  async (_, res, next) => {
    const entry = pool.find(({ busy }) => !busy);

    if (entry && INSTANCE_LIFE - Date.now() + entry.startTime >= INSTANCE_MIN_LIFE) {
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

      setTimeout(() => {
        console.log(`Instance ${entry.session.value.sessionId} reached EOL, removing.`);

        removeInline(pool, entry);
      }, INSTANCE_LIFE);

      return responseBuffer;
    }),
    selfHandleResponse: true,
    target: WEB_DRIVER_URL
  })
);

app.delete(
  '/wd/hub/session/:sessionId',
  (req, res, next) => {
    const entry = pool.find(entry => entry.session.value.sessionId === req.params.sessionId);

    if (entry && entry.numUsed < NUM_RECYCLE) {
      console.log(`Recycling instance ${entry.session.value.sessionId}.`);

      entry.busy = false;

      return res.status(200).end();
    }

    console.log(`Instance ${entry.session.value.sessionId} maximum usage is up, terminating.`);

    removeInline(pool, entry);

    next();
  },
  proxy
);

app.use('/', proxy);
app.listen(4444);
