/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { decode } from '@jridgewell/sourcemap-codec';
import { scenario } from '@testduet/given-when-then';
import { build, type Plugin } from 'esbuild';

import injectCSSPlugin from './injectCSSPlugin';

const PLACEHOLDER = '@--STYLES--@';

// Characters that JSON.stringify() escapes, so the embedded string is longer than the CSS.
const CSS = `.a::before {
  content: "quote \\" and backslash \\\\";
}

.b {
  color: red;
}
`;

const FILES: ReadonlyMap<string, string> = new Map([
  [
    'index.js',
    `import './style.css';

export const styleContent = '${PLACEHOLDER}';

export function afterTheStyles(value) {
  return value + 1;
}
`
  ],
  ['style.css', CSS]
]);

const virtualFilesPlugin: Plugin = {
  name: 'virtual-files',
  setup(pluginBuild) {
    pluginBuild.onResolve({ filter: /\.(css|js)$/u }, ({ path }) => ({
      namespace: 'virtual',
      path: path.replace(/^\.\//u, '')
    }));
    pluginBuild.onLoad({ filter: /\.(css|js)$/u, namespace: 'virtual' }, ({ path }) => ({
      contents: FILES.get(path) ?? '',
      loader: path.endsWith('.css') ? 'css' : 'js'
    }));
  }
};

async function buildMinified(plugins: Plugin[], banner: string | undefined) {
  const { outputFiles } = await build({
    absWorkingDir: process.cwd(),
    ...(banner && { banner: { js: banner } }),
    bundle: true,
    entryPoints: ['index.js'],
    format: 'esm',
    metafile: true,
    minify: true,
    outdir: 'inject-css-plugin-spec',
    plugins: [virtualFilesPlugin, ...plugins],
    sourcemap: true,
    write: false
  });

  const js = outputFiles.find(({ path }) => path.endsWith('.js'))?.text ?? '';
  const { mappings, sources }: { mappings: string; sources: readonly string[] } = JSON.parse(
    outputFiles.find(({ path }) => path.endsWith('.js.map'))?.text ?? '{ "mappings": "", "sources": [] }'
  );

  return Object.freeze({ js, mappings: decode(mappings), sources });
}

// Original position of the first generated "return", which comes after the embedded styles.
function mapReturn({
  js,
  mappings,
  sources
}: {
  js: string;
  mappings: ReturnType<typeof decode>;
  sources: readonly string[];
}) {
  const index = js.indexOf('return');
  const before = js.slice(0, index);
  const column = index - before.lastIndexOf('\n') - 1;
  // The last segment that starts at or before the column, as source map consumers do.
  const segment = (mappings[before.split('\n').length - 1] || [])
    .filter(([generatedColumn]) => generatedColumn <= column)
    .at(-1);

  return Object.freeze({
    column: segment?.[3],
    line: segment?.[2] === undefined ? undefined : segment[2] + 1,
    source: segment?.[1] === undefined ? undefined : sources[segment[1]]
  });
}

scenario(
  'injectCSSPlugin',
  bdd => {
    for (const [description, banner] of [
      ['a minified build', undefined],
      // The placeholder is not on the first line, so its column differs from its index in the file.
      ['a minified build after a banner of two lines', '/* Banner */\n/* More banner */']
    ] as const) {
      bdd
        .given(`${description} with the CSS embedded, and one with the placeholder kept`, async () =>
          Object.freeze({
            embedded: await buildMinified([injectCSSPlugin({ stylesPlaceholder: PLACEHOLDER })], banner),
            placeholder: await buildMinified([], banner)
          })
        )
        .when('mapping the code after the styles back to the source', ({ embedded, placeholder }) =>
          Object.freeze({ embedded: mapReturn(embedded), placeholder: mapReturn(placeholder) })
        )
        .then('the CSS should replace the placeholder', ({ embedded }) => {
          expect(embedded.js).not.toContain(PLACEHOLDER);
          expect(embedded.js).toContain('color:red');
        })
        .and('should map to the same source position as without the plugin', (_, { embedded, placeholder }) => {
          expect(placeholder).toEqual({ column: 2, line: 6, source: 'virtual:index.js' });
          expect(embedded).toEqual(placeholder);
        });
    }
  },
  JestGlobals
);
