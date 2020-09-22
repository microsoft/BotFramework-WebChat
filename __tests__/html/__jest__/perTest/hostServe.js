const { createServer } = require('http');
const getPort = require('get-port');
const serveHandler = require('serve-handler');

async function hostServe(abortSignal, serveHandlerOptions) {
  return new Promise(async (resolve, reject) => {
    const port = await getPort();
    const httpServer = createServer((req, res) => serveHandler(req, res, serveHandlerOptions));

    abortSignal &&
      abortSignal.addEventListener('abort', () => {
        httpServer.close();

        reject(new Error('Server aborted.'));
      });

    httpServer.once('error', reject);
    httpServer.listen(port, () => resolve({ port }));
  });
}

module.exports = hostServe;
