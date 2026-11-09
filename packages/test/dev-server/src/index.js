import { createStaticHandler, TEST_MOUNTS } from '@msinternal/test-web-server/createStaticHandler';
import { fileURLToPath } from 'url';

const { PORT = 5001 } = process.env;

createStaticHandler({
  // Using compression will serve files faster from GitHub Codespaces, from 500ms to 200ms.
  compress: true,
  listDirectories: true,
  mounts: TEST_MOUNTS,
  root: fileURLToPath(new URL('../../../../', import.meta.url)),
  testHeaders: true
}).listen(PORT, () => console.log(`Web Chat development server listening on port ${PORT}`));
