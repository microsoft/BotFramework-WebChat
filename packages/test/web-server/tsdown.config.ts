import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: {
    index: './src/index.ts'
  },
  format: 'cjs',
  platform: 'node',
  noExternal: ['selfsigned', 'serve-handler']
});
