import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    createStaticHandler: './src/createStaticHandler.ts',
    index: './src/index.ts'
  },
  format: 'cjs',
  platform: 'node',
  // The test container runs dist/index.js without node_modules.
  noExternal: ['compression', 'express', 'selfsigned'],
  onSuccess: 'touch ./package.json'
});
