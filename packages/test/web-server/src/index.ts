/* eslint-disable no-console */
import { createServer } from 'node:http';
import { createServer as createSecureServer } from 'node:https';
import selfsigned from 'selfsigned';

import { createStaticHandler, TEST_MOUNTS } from './createStaticHandler.js';

const {
  // eslint-disable-next-line no-magic-numbers
  env: { PORT = 5081, PORTS = 5443 }
} = process;

(async () => {
  const attrs = [{ name: 'commonName', value: 'webchat2' }];
  const pems = await selfsigned.generate(attrs, { days: 365 });
  const handler = createStaticHandler({ mounts: TEST_MOUNTS, root: process.cwd() });

  createSecureServer(
    {
      cert: pems.cert,
      key: pems.private
    },
    handler
  ).listen(PORTS, () => console.log(`Listening to port ${PORTS} (secure).`));

  createServer(handler).listen(PORT, () => console.log(`Listening to port ${PORT} (insecure).`));
})();
