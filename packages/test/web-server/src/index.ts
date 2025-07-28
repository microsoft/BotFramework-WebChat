/* eslint-disable no-console */
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createServer as createSecureServer } from 'node:https';
import selfsigned from 'selfsigned';
import handleServe from 'serve-handler';

import { handleESM } from './handleESM';

const {
  // eslint-disable-next-line no-magic-numbers
  env: { PORT = 5081, PORTS = 5443 }
} = process;

(async () => {
  const config = JSON.parse(await readFile('./serve.json', 'utf8'));
  const attrs = [{ name: 'commonName', value: 'webchat2' }];
  const pems = selfsigned.generate(attrs, { days: 365 });

  const handler = (req, res) => {
    if (req.url.startsWith('/esm/')) {
      return handleESM(req, res);
    }

    return handleServe(req, res, config);
  };

  createSecureServer(
    {
      cert: pems.cert,
      key: pems.private
    },
    handler
  ).listen(PORTS, () => console.log(`Listening to port ${PORTS} (secure).`));

  createServer(handler).listen(PORT, () => console.log(`Listening to port ${PORT} (insecure).`));
})();
