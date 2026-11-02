/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { scenario } from '@testduet/given-when-then';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { request } from 'node:http';
import { type AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { createStaticHandler } from './createStaticHandler';

// Files under a temporary root: "/assets" and "/" are mounted, "secret.txt" is not.
const FILES: ReadonlyMap<string, string> = new Map([
  ['assets/asset.txt', 'asset'],
  ['pages/both.html', 'page next to a folder'],
  ['pages/both/index.html', 'folder next to a page'],
  ['pages/folder/index.html', 'folder index'],
  ['pages/large.js', 'large;'.repeat(1_000)],
  ['pages/page.fluent.html', 'page'],
  ['secret.txt', 'secret']
]);

async function startServer() {
  const root = await mkdtemp(join(tmpdir(), 'create-static-handler-'));

  await Promise.all(
    Array.from(FILES, async ([path, content]) => {
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await mkdir(join(root, path, '..'), { recursive: true });
      // eslint-disable-next-line security/detect-non-literal-fs-filename
      await writeFile(join(root, path), content);
    })
  );

  const server = createStaticHandler({
    compress: true,
    listDirectories: true,
    mounts: [
      ['/assets', 'assets'],
      ['/', 'pages']
    ],
    root,
    testHeaders: true
  }).listen(0, '127.0.0.1');

  await new Promise(resolve => server.once('listening', resolve));

  const { port } = server.address() as AddressInfo;

  return Object.freeze({
    fetchPath: (path: string, init?: RequestInit) =>
      fetch(`http://127.0.0.1:${port}${path}`, { redirect: 'manual', ...init }),
    // Sends the path as is: fetch() would resolve "%2e%2e" before sending.
    getRawPath: (path: string) =>
      new Promise<string>((resolve, reject) =>
        request({ host: '127.0.0.1', path, port }, res => {
          let body = `${res.statusCode} `;

          res.on('data', chunk => (body += chunk)).on('end', () => resolve(body));
        })
          .on('error', reject)
          .end()
      ),
    stop: async () => {
      server.close();
      await rm(root, { force: true, recursive: true });
    }
  });
}

scenario(
  'createStaticHandler',
  bdd => {
    bdd
      .given('a server with "/assets" and "/" mounted', startServer, ({ stop }) => stop())
      .when('requesting the root folder and a file outside the mounts, encoded in different ways', ({ getRawPath }) =>
        Promise.all(
          [
            '/assets/%2e%2e/', // "..", resolves to the "/" mount
            '/assets/../', // ".." as is, resolves to the "/" mount
            '/assets/..%2F..%2F', // ".." with an encoded slash
            '/assets/a%5C..%5C..%5C', // backslashes, separators on Windows
            '/assets/%2e%2e/%2e%2e/secret.txt',
            '/assets/..%5C..%5Csecret.txt',
            '/assets/%00/'
          ].map(getRawPath)
        )
      )
      .then('should never list or serve anything outside the mounts', (_, responses) => {
        expect(responses.filter(response => response.startsWith('200 ') && response.includes('secret'))).toEqual([]);
        expect(responses.map(response => response.split(' ')[0])).toEqual([
          '200',
          '200',
          '404',
          '404',
          '404',
          '404',
          '404'
        ]);
      });

    bdd
      .given('a server with "/assets" and "/" mounted', startServer, ({ stop }) => stop())
      .when('requesting a page without ".html" and with a query', ({ fetchPath }) =>
        fetchPath('/page.fluent?variant=x')
      )
      .then('should serve the page without a redirect', async (_, res) => {
        expect(res.status).toBe(200);
        await expect(res.text()).resolves.toBe('page');
      });

    bdd
      .given('a server with "/assets" and "/" mounted', startServer, ({ stop }) => stop())
      .when('requesting a folder without the trailing slash and with a query', ({ fetchPath }) =>
        fetchPath('/folder?x=1')
      )
      .then('should redirect to the folder, keeping the query', (_, res) => {
        expect(res.status).toBe(302);
        expect(res.headers.get('location')).toBe('/folder/?x=1');
      })
      .and('the folder should serve its index.html', async ({ fetchPath }) => {
        await expect(fetchPath('/folder/').then(res => res.text())).resolves.toBe('folder index');
      });

    bdd
      .given('a server with "/assets" and "/" mounted', startServer, ({ stop }) => stop())
      .when('requesting a page that has a folder of the same name, with a query', ({ fetchPath }) =>
        fetchPath('/both?x=1')
      )
      .then('should serve the page, not redirect to the folder', async (_, res) => {
        expect(res.status).toBe(200);
        await expect(res.text()).resolves.toBe('page next to a folder');
      });

    bdd
      .given('a server with "/assets" and "/" mounted', startServer, ({ stop }) => stop())
      .when('requesting a folder without index.html', ({ fetchPath }) => fetchPath('/assets/'))
      .then('should list its files', async (_, res) => {
        expect(res.status).toBe(200);
        await expect(res.text()).resolves.toContain('<a href="/assets/asset.txt">asset.txt</a>');
      });

    bdd
      .given('a server with "/assets" and "/" mounted', startServer, ({ stop }) => stop())
      .when('requesting a script, accepting gzip', ({ fetchPath }) =>
        fetchPath('/large.js', { headers: { 'accept-encoding': 'gzip' } })
      )
      .then('should send the test headers and compress', (_, res) => {
        expect(res.headers.get('cache-control')).toBe('no-cache no-store no-transform');
        expect(res.headers.get('content-encoding')).toBe('gzip');
      });
  },
  JestGlobals
);
