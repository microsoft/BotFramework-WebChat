import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: './src/index.ts'
  },
  format: 'cjs',
  platform: 'node',
  noExternal: ['selfsigned', 'serve-handler'],
  onSuccess: 'touch ./package.json'
});
