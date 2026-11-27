import { defineConfig, type UserConfig } from 'tsdown';

// The test container runs dist/index.js without node_modules: every entry bundles its dependencies and shares no chunk.
// rolldown always splits shared code into chunks, so build one entry per config.
function createConfig(entry: Record<string, string>): UserConfig {
  return {
    deps: { alwaysBundle: [/^(?:compression|express|selfsigned)(?:\/|$)/u], onlyBundle: false },
    entry,
    // `.js`, not `.cjs`: the container and package.json "main" load dist/index.js.
    fixedExtension: false,
    format: 'cjs',
    platform: 'node',
    report: false
  };
}

export default defineConfig([
  createConfig({ createStaticHandler: './src/createStaticHandler.ts' }),
  { ...createConfig({ index: './src/index.ts' }), onSuccess: 'touch ./package.json' }
]);
