import { createStaticHandler, SAMPLES_MOUNTS } from '@msinternal/test-web-server/createStaticHandler';
import { fileURLToPath } from 'url';

const { PORT = 5000 } = process.env;

createStaticHandler({
  compress: true,
  homePage: '/samples/index.html',
  mounts: SAMPLES_MOUNTS,
  root: fileURLToPath(new URL('../../../../', import.meta.url))
}).listen(PORT, () => console.log(`Web Chat samples listening on port ${PORT}`));
