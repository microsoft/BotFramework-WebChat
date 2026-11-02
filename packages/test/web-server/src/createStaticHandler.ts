import compression from 'compression';
import express, { type Express, type RequestHandler, type Response } from 'express';
import { type Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { isAbsolute, join, relative, resolve } from 'node:path';

type Mount = readonly [urlPrefix: string, directory: string];

// Folder listings hide what serve-test.json hid: dot files, snapshots, and scripts, styles, images and data.
const UNLISTED = /^\.|^__image_snapshots__$|\.(css|ico|js|json|map|png|ts|tsx)$/u;

const escapeHTML = (value: string): string => value.replace(/[&<>"']/gu, char => `&#${char.charCodeAt(0)};`);

// Test pages are always revalidated, so they are never stale after a rebuild: unchanged files cost a 304 (ETag and
// Last-Modified from express.static). No "no-store", which would download the bundles again on every page, and no
// "no-transform", which would stop `compression`.
function setTestHeaders(res: Response, path: string): void {
  res.setHeader('Cache-Control', 'no-cache');

  /\.coop-noopener-allow-popups\./u.test(path) && res.setHeader('Cross-Origin-Opener-Policy', 'noopener-allow-popups');
}

// The folder below `directory` for a decoded URL path, or undefined if it is hidden or would leave `directory`
// (e.g. ".." encoded as "%2e%2e", or a backslash from "%5C", which Windows treats as a separator).
function resolveWithin(directory: string, subpath: string): string | undefined {
  if (/[\\\0]/u.test(subpath) || subpath.split('/').some(segment => segment.startsWith('.'))) {
    return undefined;
  }

  const path = resolve(directory, subpath);
  const fromDirectory = relative(directory, path);

  return fromDirectory.startsWith('..') || isAbsolute(fromDirectory) ? undefined : path;
}

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

// The entries of the first mounted folder at a decoded URL path ending with "/" ("/" is __tests__/html2 in tests).
async function readMountedDirectory(
  mounts: readonly Mount[],
  root: string,
  urlPath: string
): Promise<readonly Dirent[] | undefined> {
  const [entries] = (
    await Promise.all(
      mounts
        .map(([urlPrefix, directory]) => [urlPrefix.replace(/\/?$/u, '/'), directory] as const)
        .filter(([prefix]) => urlPath.startsWith(prefix))
        .map(([prefix, directory]) => resolveWithin(join(root, directory), urlPath.slice(prefix.length)))
        .map(
          path =>
            // eslint-disable-next-line security/detect-non-literal-fs-filename
            path && readdir(path, { withFileTypes: true }).catch(() => undefined)
        )
    )
  ).filter(entries => entries);

  return entries;
}

// The decoded path of a request URL, with a trailing "/", or undefined if it cannot be decoded.
function toFolderPath(pathname: string): string | undefined {
  try {
    return decodeURIComponent(pathname).replace(/\/?$/u, '/');
  } catch {
    return undefined;
  }
}

// Redirects "/folder?x" to "/folder/?x", keeping the query. It runs after pages, so "page" is still "page.html"
// when a "page" folder exists next to it.
function redirectDirectory(mounts: readonly Mount[], root: string): RequestHandler {
  return async (req, res, next) => {
    const { pathname, search } = new URL(req.originalUrl, 'http://localhost/');
    const urlPath = pathname.endsWith('/') ? undefined : toFolderPath(pathname);

    urlPath && (await readMountedDirectory(mounts, root, urlPath)) ? res.redirect(`${pathname}/${search}`) : next();
  };
}

// Lists a mounted folder without index.html.
function listDirectory(mounts: readonly Mount[], root: string): RequestHandler {
  return async (req, res, next) => {
    const { pathname } = new URL(req.originalUrl, 'http://localhost/');
    const urlPath = pathname.endsWith('/') ? toFolderPath(pathname) : undefined;
    const entries = urlPath && (await readMountedDirectory(mounts, root, urlPath));

    if (!urlPath || !entries) {
      return next();
    }

    const parentLink =
      urlPath === '/' ? '' : `<li><a href="${escapeHTML(encodeURI(urlPath.replace(/[^/]+\/$/u, '')))}">../</a></li>`;
    const links = entries
      .filter(({ name }) => !UNLISTED.test(name))
      .map(entry => `${entry.name}${entry.isDirectory() ? '/' : ''}`)
      .sort()
      .map(name => `<li><a href="${escapeHTML(encodeURI(urlPath + name))}">${escapeHTML(name)}</a></li>`);

    setTestHeaders(res, urlPath);

    res
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
  root,
  testHeaders
}: {
  readonly compress?: boolean | undefined;
  readonly homePage?: string | undefined;
  readonly listDirectories?: boolean | undefined;
  readonly mounts: readonly Mount[];
  readonly root: string;
  readonly testHeaders?: boolean | undefined;
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
        ...(testHeaders ? { setHeaders: setTestHeaders } : { cacheControl: false })
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

  app.use(redirectDirectory(mounts, root));
  listDirectories && app.use(listDirectory(mounts, root));

  return app;
}

export { createStaticHandler, SAMPLES_MOUNTS, TEST_MOUNTS, type Mount };
