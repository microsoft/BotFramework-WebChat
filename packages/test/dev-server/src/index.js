import compression from 'compression';
import express from 'express';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import serve from 'serve-handler';
import { fileURLToPath } from 'url';

const { PORT = 5001 } = process.env;
const resolveFromProjectRoot = resolve.bind(undefined, fileURLToPath(import.meta.url), '../../');
const resolveFromRepositoryRoot = resolveFromProjectRoot.bind(undefined, '../../../');

(async function () {
  const app = express();
  const serveConfigJSON = JSON.parse(await readFile(resolveFromRepositoryRoot('./serve-test.json'), 'utf8'));

  // Hide all dot files.
  app.use((req, res, next) => (/\/\./u.test(req.url) ? res.status(404).end() : next()));

  // Using compression will serve files faster from GitHub Codespaces, from 500ms to 200ms.
  app.use(compression());

  app.use(
    '/__dist__/botframework-webchat-fluent-theme.development.js',
    express.static(
      resolve(
        fileURLToPath(import.meta.url),
        '../../../../fluent-theme/dist/botframework-webchat-fluent-theme.development.js'
      )
    )
  );

  app.use(
    '/__dist__/botframework-webchat-fluent-theme.development.js.map',
    express.static(
      resolve(
        fileURLToPath(import.meta.url),
        '../../../../fluent-theme/dist/botframework-webchat-fluent-theme.development.js.map'
      )
    )
  );

  app.use(
    '/__dist__/botframework-webchat-fluent-theme.production.min.js',
    express.static(
      resolve(
        fileURLToPath(import.meta.url),
        '../../../../fluent-theme/dist/botframework-webchat-fluent-theme.production.min.js'
      )
    )
  );

  app.use(
    '/__dist__/botframework-webchat-fluent-theme.production.min.js.map',
    express.static(
      resolve(
        fileURLToPath(import.meta.url),
        '../../../../fluent-theme/dist/botframework-webchat-fluent-theme.production.min.js.map'
      )
    )
  );

  app.use(
    '/__dist__/fluent-bundle.development.js',
    express.static(
      resolve(fileURLToPath(import.meta.url), '../../../../test/fluent-bundle/dist/fluent-bundle.development.js')
    )
  );

  app.use(
    '/__dist__/fluent-bundle.development.js.map',
    express.static(
      resolve(fileURLToPath(import.meta.url), '../../../../test/fluent-bundle/dist/fluent-bundle.development.js.map')
    )
  );

  app.use(
    '/__dist__/fluent-bundle.production.min.js',
    express.static(
      resolve(fileURLToPath(import.meta.url), '../../../../test/fluent-bundle/dist/fluent-bundle.production.min.js')
    )
  );

  app.use(
    '/__dist__/fluent-bundle.production.min.js.map',
    express.static(
      resolve(fileURLToPath(import.meta.url), '../../../../test/fluent-bundle/dist/fluent-bundle.production.min.js.map')
    )
  );

  app.use('/__dist__/webchat*', express.static(resolve(fileURLToPath(import.meta.url), '../../../bundle/dist')));

  // Other requests will be served by `serve-handler` based on `/serve-test.json`.
  app.use((req, res) => serve(req, res, { ...serveConfigJSON, public: resolveFromRepositoryRoot() }));

  app.listen(PORT, () => console.log(`Web Chat development server listening on port ${PORT}`));
})();
