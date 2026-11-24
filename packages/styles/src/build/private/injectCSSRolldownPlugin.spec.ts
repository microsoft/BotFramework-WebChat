/// <reference types="jest" />

import * as JestGlobals from '@jest/globals';
import { decode, encode } from '@jridgewell/sourcemap-codec';
import { scenario } from '@testduet/given-when-then';
import { join } from 'node:path';
import type { Rolldown } from 'tsdown';

import injectCSSRolldownPlugin from './injectCSSRolldownPlugin';

test.each(['a\\b', 'a"b', "a'b", 'a`b', 'a$b', 'a b'])(
  'a placeholder with a character that a string literal may escape (%p) throws',
  stylesPlaceholder => {
    expect(() => injectCSSRolldownPlugin({ stylesPlaceholder })).toThrow(
      'inject-css-plugin: the placeholder for styles may contain only letters, digits, "_", "@", "." and "-"'
    );
  }
);

test.each(['@--COMPONENT-STYLES-CONTENT--@', '@--DECORATOR-STYLES-CONTENT--@', '@--FLUENT-STYLES-CONTENT--@'])(
  'the placeholder %p is accepted',
  stylesPlaceholder => {
    expect(() => injectCSSRolldownPlugin({ stylesPlaceholder })).not.toThrow();
  }
);

const PLACEHOLDER = '@--STYLES--@';

// Characters that JSON.stringify() escapes, so the embedded string is longer than the CSS.
const CSS = `.a::before {
  content: "quote \\" and backslash \\\\";
}

.b {
  color: red;
}
`;

// A minified chunk and its source map, for this source (index.js):
//
// import './style.css';
//
// export const styleContent = '@--STYLES--@';
//
// export function afterTheStyles(value) {
//   return value + 1;
// }
function createBundle(banner: string | undefined): Rolldown.OutputBundle {
  const last = `const e="${PLACEHOLDER}";function t(n){return n+1}export{t as afterTheStyles,e as styleContent};`;
  const lines = [...(banner ? banner.split('\n') : []), last];

  // Zero-based [generated column, source, line, column] of `const`, `function`, `return`, `n+1` and `export`.
  const segments: [number, number, number, number][] = [
    [0, 0, 2, 0],
    [last.indexOf('function'), 0, 4, 0],
    [last.indexOf('return'), 0, 5, 2],
    [last.indexOf('n+1'), 0, 5, 9],
    [last.indexOf('export'), 0, 2, 0]
  ];
  const mappings = encode(lines.map((_, index) => (index === lines.length - 1 ? segments : [])));

  return {
    'index.css': { fileName: 'index.css', source: CSS, type: 'asset' },
    'index.js': {
      code: lines.join('\n'),
      facadeModuleId: '/index.js',
      fileName: 'index.js',
      imports: [],
      isEntry: true,
      sourcemapFileName: 'index.js.map',
      type: 'chunk'
    },
    'index.js.map': {
      fileName: 'index.js.map',
      source: JSON.stringify({ mappings, names: [], sources: ['index.js'], version: 3 }),
      type: 'asset'
    }
  } as unknown as Rolldown.OutputBundle;
}

function readChunk(bundle: Rolldown.OutputBundle) {
  const { code } = bundle['index.js'] as Rolldown.OutputChunk;
  const { mappings, sources }: { mappings: string; sources: readonly string[] } = JSON.parse(
    (bundle['index.js.map'] as Rolldown.OutputAsset).source as string
  );

  return Object.freeze({ js: code, mappings: decode(mappings), sources });
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
  'injectCSSRolldownPlugin',
  bdd => {
    for (const [description, banner] of [
      ['a minified chunk', undefined],
      // The placeholder is not on the first line, so its column differs from its index in the file.
      ['a minified chunk after a banner of two lines', '/* Banner */\n/* More banner */']
    ] as const) {
      bdd
        .given(`${description} with the CSS embedded, and one with the placeholder kept`, () => {
          const bundle = createBundle(banner);
          const { generateBundle } = injectCSSRolldownPlugin({ stylesPlaceholder: PLACEHOLDER });

          (generateBundle as { handler: (...args: unknown[]) => void }).handler.call(
            undefined,
            { dir: join(process.cwd(), 'dist') },
            bundle,
            false
          );

          return Object.freeze({ embedded: readChunk(bundle), placeholder: readChunk(createBundle(banner)) });
        })
        .when('mapping the code after the styles back to the source', ({ embedded, placeholder }) =>
          Object.freeze({ embedded: mapReturn(embedded), placeholder: mapReturn(placeholder) })
        )
        .then('the CSS should replace the placeholder', ({ embedded }) => {
          expect(embedded.js).not.toContain(PLACEHOLDER);
          expect(embedded.js).toContain(`const e=${JSON.stringify(CSS)};`);
        })
        .and('should map to the same source position as without the plugin', (_, { embedded, placeholder }) => {
          expect(placeholder).toEqual({ column: 2, line: 6, source: 'index.js' });
          expect(embedded).toEqual(placeholder);
        });
    }
  },
  JestGlobals
);
