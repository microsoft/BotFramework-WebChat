import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: './src/index.ts'
  },
  format: 'cjs',
  platform: 'node',
  noExternal: ['selfsigned', 'serve-handler'],
  external: ['@ast-grep/napi']
});
