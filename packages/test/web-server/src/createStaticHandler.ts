import compression from 'compression';
import express, { type Express, type RequestHandler } from 'express';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

type Mount = readonly [urlPrefix: string, directory: string];

// Folder listings hide what serve-test.json hid: dot files, snapshots, and scripts, styles, images and data.
const UNLISTED = /^\.|^__image_snapshots__$|\.(css|ico|js|json|map|png|ts|tsx)$/u;

const escapeHTML = (value: string): string => value.replace(/[&<>"']/gu, char => `&#${char.charCodeAt(0)};`);

// Where each URL prefix is served from, relative to the root, first match wins.
// Each entry serves its folder at any depth, a page is also served without ".html" (e.g. "./page?variant=fluent").
const TEST_MOUNTS: readonly Mount[] = Object.freeze([
  Object.freeze(['/assets', '__tests__/assets'] as const),
  Object.freeze(['/__dist__/packages/bundle/static', 'packages/bundle/static'] as const),
  Object.freeze(['/__dist__/packages/fluent-theme/static', 'packages/fluent-theme/static'] as const),
  Object.freeze(['/__dist__/packages/test/test-assets/out', 'packages/test/test-assets/out'] as const),
  Object.freeze(['/__dist__', 'packages/bundle/dist'] as const),
  Object.freeze(['/__dist__', 'packages/debug-theme/dist'] as const),
  Object.freeze(['/__dist__', 'packages/fluent-theme/dist'] as const),
  Object.freeze(['/', '__tests__/html2'] as const),
  Object.freeze(['/', 'packages/test/harness/dist'] as const),
  Object.freeze(['/', 'packages/test/page-object/dist'] as const),
  Object.freeze(['/', '.'] as const)
]);

// For `npm start`: the samples, with the bundles at the root as the samples load them (e.g. "/webchat.js").
const SAMPLES_MOUNTS: readonly Mount[] = Object.freeze([
  Object.freeze(['/', 'packages/bundle/dist'] as const),
  Object.freeze(['/', 'packages/debug-theme/dist'] as const),
  Object.freeze(['/', 'packages/directlinespeech/dist'] as const),
  Object.freeze(['/', 'packages/fluent-theme/dist'] as const),
  Object.freeze(['/', '.'] as const)
]);

// Lists the first mounted folder at the URL ("/" lists __tests__/html2), for folders without index.html.
function listDirectory(mounts: readonly Mount[], root: string): RequestHandler {
  return async (req, res, next) => {
    const urlPath = decodeURIComponent(new URL(req.originalUrl, 'http://localhost/').pathname).replace(/\/?$/u, '/');

    if (/\/\./u.test(urlPath)) {
      return next();
    }

    const [entries] = (
      await Promise.all(
        mounts
          .map(([urlPrefix, directory]) => [urlPrefix.replace(/\/?$/u, '/'), directory] as const)
          .filter(([prefix]) => urlPath.startsWith(prefix))
          .map(([prefix, directory]) =>
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            readdir(join(root, directory, urlPath.slice(prefix.length)), { withFileTypes: true }).catch(() => undefined)
          )
      )
    ).filter(entries => entries);

    if (!entries) {
      return next();
    }

    const parentLink =
      urlPath === '/' ? '' : `<li><a href="${escapeHTML(encodeURI(urlPath.replace(/[^/]+\/$/u, '')))}">../</a></li>`;
    const links = entries
      .filter(({ name }) => !UNLISTED.test(name))
      .map(entry => `${entry.name}${entry.isDirectory() ? '/' : ''}`)
      .sort()
      .map(name => `<li><a href="${escapeHTML(encodeURI(urlPath + name))}">${escapeHTML(name)}</a></li>`);

    res
      .set('Cache-Control', 'no-cache no-store no-transform')
      .type('html')
      .send(
        `<!doctype html><title>${escapeHTML(urlPath)}</title><h1>${escapeHTML(urlPath)}</h1><ul>${parentLink}${links.join('')}</ul>`
      );
  };
}

function createStaticHandler({
  compress,
  homePage,
  listDirectories,
  mounts,
  root
}: {
  readonly compress?: boolean | undefined;
  readonly homePage?: string | undefined;
  readonly listDirectories?: boolean | undefined;
  readonly mounts: readonly Mount[];
  readonly root: string;
}): Express {
  const app = express();
  const router = express.Router();

  compress && app.use(compression());
  homePage && app.get('/', (_, res) => res.redirect(homePage));

  for (const [urlPrefix, directory] of mounts) {
    router.use(
      urlPrefix,
      express.static(join(root, directory), {
        dotfiles: 'ignore',
        redirect: false,
        setHeaders(res, path) {
          res.setHeader('Cache-Control', 'no-cache no-store no-transform');

          /\.coop-noopener-allow-popups\./u.test(path) &&
            res.setHeader('Cross-Origin-Opener-Policy', 'noopener-allow-popups');
        }
      })
    );
  }

  app.use(router);

  // Serves "page" and "page?query" as "page.html", without a redirect, so the query string is kept.
  app.use((req, res, next) => {
    const { pathname, search } = new URL(req.url, 'http://localhost/');

    if (/(\.html|\/)$/u.test(pathname)) {
      return next();
    }

    req.url = `${pathname}.html${search}`;
    router(req, res, next);
  });

  listDirectories && app.use(listDirectory(mounts, root));

  return app;
}

export { createStaticHandler, SAMPLES_MOUNTS, TEST_MOUNTS, type Mount };
