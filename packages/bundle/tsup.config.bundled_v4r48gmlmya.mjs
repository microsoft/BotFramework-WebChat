// tsup.config.ts
import path from "path";
import { defineConfig } from "tsup";

// ../../esbuildBabelPluginIstanbul.ts
import { transformFileAsync } from "@babel/core";
import { join } from "path";
import { fileURLToPath } from "url";
var __injected_import_meta_url__ = "file:///workspaces/BotFramework-WebChat/esbuildBabelPluginIstanbul.ts";
var defaultPredicate = (args) => !args.path.includes("/node_modules/");
var babelPlugin = ({ filter, loader, name, predicate = defaultPredicate }) => ({
  name,
  setup(build) {
    build.onLoad({ filter }, async (args) => {
      if (!predicate(args)) {
        return;
      }
      const result = await transformFileAsync(args.path, {
        configFile: join(fileURLToPath(__injected_import_meta_url__), "../babel.profile.config.json"),
        rootMode: "root",
        sourceFileName: args.path
      });
      if (!result?.code) {
        throw new Error(`Failed to add instrumentation code to ${args.path}.`);
      }
      return { contents: result.code, loader };
    });
  }
});

// ../../tsup.base.config.ts
import lightningCssPlugin from "unplugin-lightningcss/esbuild";
var env = process.env.NODE_ENV || "development";
var { npm_package_version } = process.env;
var istanbulPredicate = (args) => defaultPredicate(args) && !/\.worker\.[cm]?[jt]s$/u.test(args.path);
var disablePlugin = (pluginName) => ({
  name: `disable-plugin-${pluginName}`,
  esbuildOptions: (options) => {
    const plugin = options.plugins?.find(({ name }) => name === pluginName);
    if (plugin) {
      plugin.setup = () => Promise.resolve();
    }
  }
});
var cssPlugin = lightningCssPlugin({
  include: [/\.module\.css$/u],
  options: {
    cssModules: {
      pattern: "w[hash]_[local]",
      pure: true,
      animation: false,
      grid: false,
      customIdents: false
    }
  }
});
var baseConfig = {
  dts: true,
  env: {
    build_tool: "tsup",
    node_env: env,
    NODE_ENV: env,
    ...npm_package_version ? { npm_package_version } : {}
  },
  plugins: [disablePlugin("postcss"), disablePlugin("svelte")],
  esbuildOptions: (options) => {
    options.define = options.define || {};
    options.define.define = "undefined";
    options.legalComments = "linked";
  },
  esbuildPlugins: env === "test" ? [
    babelPlugin({
      filter: /\.[cm]?js$/u,
      loader: "jsx",
      name: "babel-plugin-istanbul:js",
      predicate: istanbulPredicate
    }),
    babelPlugin({
      filter: /\.jsx$/u,
      loader: "jsx",
      name: "babel-plugin-istanbul:jsx",
      predicate: istanbulPredicate
    }),
    babelPlugin({
      filter: /\.[cm]?ts$/u,
      loader: "ts",
      name: "babel-plugin-istanbul:ts",
      predicate: istanbulPredicate
    }),
    babelPlugin({
      filter: /\.tsx$/u,
      loader: "tsx",
      name: "babel-plugin-istanbul:tsx",
      predicate: istanbulPredicate
    }),
    cssPlugin
  ] : [cssPlugin],
  format: "esm",
  loader: { ".js": "jsx" },
  metafile: true,
  minify: env === "production" || env === "test",
  platform: "browser",
  sourcemap: true,
  splitting: true,
  target: ["chrome100", "firefox100", "safari15"]
};
var tsup_base_config_default = baseConfig;

// tsup.config.ts
var resolveCognitiveServicesToES2015 = {
  name: "microsoft-cognitiveservices-speech-sdk",
  setup(build) {
    build.onResolve({ filter: /microsoft-cognitiveservices-speech-sdk.+/u }, (args) => ({
      path: path.join(process.cwd(), "../../node_modules", args.path.replace("distrib/lib", "distrib/es2015"))
    }));
  }
};
var resolveReact = {
  name: "isomorphic-react",
  setup(build) {
    build.onResolve({ filter: /^(react|react-dom)$/u }, ({ path: pkgNamne }) => ({
      path: path.join(process.cwd(), "../../node_modules", `isomorphic-${pkgNamne}/dist/${pkgNamne}.js`)
    }));
  }
};
var config = {
  ...tsup_base_config_default,
  entry: {
    "botframework-webchat": "./src/boot/exports/full.ts",
    "botframework-webchat.es5": "./src/boot/exports/full-es5.ts",
    "botframework-webchat.minimal": "./src/boot/exports/minimal.ts"
  },
  env: {
    ...tsup_base_config_default.env,
    // Followings are required by microsoft-cognitiveservices-speech-sdk:
    NODE_TLS_REJECT_UNAUTHORIZED: "",
    SPEECH_CONDUCT_OCSP_CHECK: "",
    SPEECH_OCSP_CACHE_ROOT: ""
  },
  esbuildPlugins: [resolveCognitiveServicesToES2015],
  noExternal: [
    "@babel/runtime",
    "memoize-one",
    "microsoft-cognitiveservices-speech-sdk",
    "web-speech-cognitive-services",
    // Belows are the dependency chain related to "regex" where it is named export-only and does not work on Webpack 4/PPUX (CJS cannot import named export).
    // Webpack 4: "Can't import the named export 'rewrite' from non EcmaScript module (only default export is available)"
    "shiki",
    // shiki -> @shikijs/core -> @shikijs/engine-javascript -> regex
    // Issues related to Webpack 4 when it tries to statically analyze dependencies.
    // The way `microsoft-cognitiveservices-speech-sdk` imported the `uuid` package (in their `Guid.js`) is causing esbuild/tsup to proxy require() into __require() for dynamic loading.
    // Webpack 4 cannot statically analyze the code and failed with error "Critical dependency: require function is used in a way in which dependencies cannot be statically extracted".
    "uuid"
  ]
};
var tsup_config_default = defineConfig([
  // Build IIFE before CJS/ESM to make npm start faster.
  {
    ...config,
    dts: false,
    entry: {
      webchat: "./src/boot/bundle/full.ts",
      "webchat-es5": "./src/boot/bundle/full-es5.ts",
      "webchat-minimal": "./src/boot/bundle/minimal.ts"
    },
    env: {
      ...config.env,
      module_format: "global"
    },
    esbuildPlugins: [...config.esbuildPlugins, resolveReact],
    format: "iife",
    outExtension() {
      return { js: ".js" };
    },
    platform: "browser",
    target: [...config.target, "es2019"]
  },
  {
    ...config,
    env: {
      ...config.env,
      module_format: "esmodules"
    },
    format: "esm"
  },
  {
    ...config,
    env: {
      ...config.env,
      module_format: "commonjs"
    },
    format: "cjs",
    target: [...config.target, "es2019"]
  }
]);
export {
  tsup_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidHN1cC5jb25maWcudHMiLCAiLi4vLi4vZXNidWlsZEJhYmVsUGx1Z2luSXN0YW5idWwudHMiLCAiLi4vLi4vdHN1cC5iYXNlLmNvbmZpZy50cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX19pbmplY3RlZF9maWxlbmFtZV9fID0gXCIvd29ya3NwYWNlcy9Cb3RGcmFtZXdvcmstV2ViQ2hhdC9wYWNrYWdlcy9idW5kbGUvdHN1cC5jb25maWcudHNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiL3dvcmtzcGFjZXMvQm90RnJhbWV3b3JrLVdlYkNoYXQvcGFja2FnZXMvYnVuZGxlXCI7Y29uc3QgX19pbmplY3RlZF9pbXBvcnRfbWV0YV91cmxfXyA9IFwiZmlsZTovLy93b3Jrc3BhY2VzL0JvdEZyYW1ld29yay1XZWJDaGF0L3BhY2thZ2VzL2J1bmRsZS90c3VwLmNvbmZpZy50c1wiO2ltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuaW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndHN1cCc7XG5pbXBvcnQgYmFzZUNvbmZpZyBmcm9tICcuLi8uLi90c3VwLmJhc2UuY29uZmlnJztcblxuLy8gUmVkaXJlY3QgaW1wb3J0IHBhdGhzIGZvciBcIm1pY3Jvc29mdC1jb2duaXRpdmVzZXJ2aWNlcy1zcGVlY2gtc2RrKC4uLilcIlxuLy8gdG8gcG9pbnQgdG8gZXMyMDE1IGRpc3RyaWJ1dGlvbiBmb3IgYWxsIGltcG9ydGluZyBtb2R1bGVzXG5jb25zdCByZXNvbHZlQ29nbml0aXZlU2VydmljZXNUb0VTMjAxNSA9IHtcbiAgbmFtZTogJ21pY3Jvc29mdC1jb2duaXRpdmVzZXJ2aWNlcy1zcGVlY2gtc2RrJyxcbiAgc2V0dXAoYnVpbGQpIHtcbiAgICBidWlsZC5vblJlc29sdmUoeyBmaWx0ZXI6IC9taWNyb3NvZnQtY29nbml0aXZlc2VydmljZXMtc3BlZWNoLXNkay4rL3UgfSwgYXJncyA9PiAoe1xuICAgICAgcGF0aDogcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICcuLi8uLi9ub2RlX21vZHVsZXMnLCBhcmdzLnBhdGgucmVwbGFjZSgnZGlzdHJpYi9saWInLCAnZGlzdHJpYi9lczIwMTUnKSlcbiAgICB9KSk7XG4gIH1cbn07XG5cbi8vIFJlZGlyZWN0IGltcG9ydCBwYXRocyBmb3IgXCJyZWFjdFwiIGFuZCBcInJlYWN0LWRvbVwiXG5jb25zdCByZXNvbHZlUmVhY3QgPSB7XG4gIG5hbWU6ICdpc29tb3JwaGljLXJlYWN0JyxcbiAgc2V0dXAoYnVpbGQpIHtcbiAgICBidWlsZC5vblJlc29sdmUoeyBmaWx0ZXI6IC9eKHJlYWN0fHJlYWN0LWRvbSkkL3UgfSwgKHsgcGF0aDogcGtnTmFtbmUgfSkgPT4gKHtcbiAgICAgIHBhdGg6IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnLi4vLi4vbm9kZV9tb2R1bGVzJywgYGlzb21vcnBoaWMtJHtwa2dOYW1uZX0vZGlzdC8ke3BrZ05hbW5lfS5qc2ApXG4gICAgfSkpO1xuICB9XG59O1xuXG5jb25zdCBjb25maWc6IHR5cGVvZiBiYXNlQ29uZmlnID0ge1xuICAuLi5iYXNlQ29uZmlnLFxuICBlbnRyeToge1xuICAgICdib3RmcmFtZXdvcmstd2ViY2hhdCc6ICcuL3NyYy9ib290L2V4cG9ydHMvZnVsbC50cycsXG4gICAgJ2JvdGZyYW1ld29yay13ZWJjaGF0LmVzNSc6ICcuL3NyYy9ib290L2V4cG9ydHMvZnVsbC1lczUudHMnLFxuICAgICdib3RmcmFtZXdvcmstd2ViY2hhdC5taW5pbWFsJzogJy4vc3JjL2Jvb3QvZXhwb3J0cy9taW5pbWFsLnRzJ1xuICB9LFxuICBlbnY6IHtcbiAgICAuLi5iYXNlQ29uZmlnLmVudixcblxuICAgIC8vIEZvbGxvd2luZ3MgYXJlIHJlcXVpcmVkIGJ5IG1pY3Jvc29mdC1jb2duaXRpdmVzZXJ2aWNlcy1zcGVlY2gtc2RrOlxuICAgIE5PREVfVExTX1JFSkVDVF9VTkFVVEhPUklaRUQ6ICcnLFxuICAgIFNQRUVDSF9DT05EVUNUX09DU1BfQ0hFQ0s6ICcnLFxuICAgIFNQRUVDSF9PQ1NQX0NBQ0hFX1JPT1Q6ICcnXG4gIH0sXG4gIGVzYnVpbGRQbHVnaW5zOiBbcmVzb2x2ZUNvZ25pdGl2ZVNlcnZpY2VzVG9FUzIwMTVdLFxuICBub0V4dGVybmFsOiBbXG4gICAgJ0BiYWJlbC9ydW50aW1lJyxcbiAgICAnbWVtb2l6ZS1vbmUnLFxuICAgICdtaWNyb3NvZnQtY29nbml0aXZlc2VydmljZXMtc3BlZWNoLXNkaycsXG4gICAgJ3dlYi1zcGVlY2gtY29nbml0aXZlLXNlcnZpY2VzJyxcbiAgICAvLyBCZWxvd3MgYXJlIHRoZSBkZXBlbmRlbmN5IGNoYWluIHJlbGF0ZWQgdG8gXCJyZWdleFwiIHdoZXJlIGl0IGlzIG5hbWVkIGV4cG9ydC1vbmx5IGFuZCBkb2VzIG5vdCB3b3JrIG9uIFdlYnBhY2sgNC9QUFVYIChDSlMgY2Fubm90IGltcG9ydCBuYW1lZCBleHBvcnQpLlxuICAgIC8vIFdlYnBhY2sgNDogXCJDYW4ndCBpbXBvcnQgdGhlIG5hbWVkIGV4cG9ydCAncmV3cml0ZScgZnJvbSBub24gRWNtYVNjcmlwdCBtb2R1bGUgKG9ubHkgZGVmYXVsdCBleHBvcnQgaXMgYXZhaWxhYmxlKVwiXG4gICAgJ3NoaWtpJywgLy8gc2hpa2kgLT4gQHNoaWtpanMvY29yZSAtPiBAc2hpa2lqcy9lbmdpbmUtamF2YXNjcmlwdCAtPiByZWdleFxuICAgIC8vIElzc3VlcyByZWxhdGVkIHRvIFdlYnBhY2sgNCB3aGVuIGl0IHRyaWVzIHRvIHN0YXRpY2FsbHkgYW5hbHl6ZSBkZXBlbmRlbmNpZXMuXG4gICAgLy8gVGhlIHdheSBgbWljcm9zb2Z0LWNvZ25pdGl2ZXNlcnZpY2VzLXNwZWVjaC1zZGtgIGltcG9ydGVkIHRoZSBgdXVpZGAgcGFja2FnZSAoaW4gdGhlaXIgYEd1aWQuanNgKSBpcyBjYXVzaW5nIGVzYnVpbGQvdHN1cCB0byBwcm94eSByZXF1aXJlKCkgaW50byBfX3JlcXVpcmUoKSBmb3IgZHluYW1pYyBsb2FkaW5nLlxuICAgIC8vIFdlYnBhY2sgNCBjYW5ub3Qgc3RhdGljYWxseSBhbmFseXplIHRoZSBjb2RlIGFuZCBmYWlsZWQgd2l0aCBlcnJvciBcIkNyaXRpY2FsIGRlcGVuZGVuY3k6IHJlcXVpcmUgZnVuY3Rpb24gaXMgdXNlZCBpbiBhIHdheSBpbiB3aGljaCBkZXBlbmRlbmNpZXMgY2Fubm90IGJlIHN0YXRpY2FsbHkgZXh0cmFjdGVkXCIuXG4gICAgJ3V1aWQnXG4gIF1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhbXG4gIC8vIEJ1aWxkIElJRkUgYmVmb3JlIENKUy9FU00gdG8gbWFrZSBucG0gc3RhcnQgZmFzdGVyLlxuICB7XG4gICAgLi4uY29uZmlnLFxuICAgIGR0czogZmFsc2UsXG4gICAgZW50cnk6IHtcbiAgICAgIHdlYmNoYXQ6ICcuL3NyYy9ib290L2J1bmRsZS9mdWxsLnRzJyxcbiAgICAgICd3ZWJjaGF0LWVzNSc6ICcuL3NyYy9ib290L2J1bmRsZS9mdWxsLWVzNS50cycsXG4gICAgICAnd2ViY2hhdC1taW5pbWFsJzogJy4vc3JjL2Jvb3QvYnVuZGxlL21pbmltYWwudHMnXG4gICAgfSxcbiAgICBlbnY6IHtcbiAgICAgIC4uLmNvbmZpZy5lbnYsXG4gICAgICBtb2R1bGVfZm9ybWF0OiAnZ2xvYmFsJ1xuICAgIH0sXG4gICAgZXNidWlsZFBsdWdpbnM6IFsuLi5jb25maWcuZXNidWlsZFBsdWdpbnMsIHJlc29sdmVSZWFjdF0sXG4gICAgZm9ybWF0OiAnaWlmZScsXG4gICAgb3V0RXh0ZW5zaW9uKCkge1xuICAgICAgcmV0dXJuIHsganM6ICcuanMnIH07XG4gICAgfSxcbiAgICBwbGF0Zm9ybTogJ2Jyb3dzZXInLFxuICAgIHRhcmdldDogWy4uLmNvbmZpZy50YXJnZXQsICdlczIwMTknXVxuICB9LFxuICB7XG4gICAgLi4uY29uZmlnLFxuICAgIGVudjoge1xuICAgICAgLi4uY29uZmlnLmVudixcbiAgICAgIG1vZHVsZV9mb3JtYXQ6ICdlc21vZHVsZXMnXG4gICAgfSxcbiAgICBmb3JtYXQ6ICdlc20nXG4gIH0sXG4gIHtcbiAgICAuLi5jb25maWcsXG4gICAgZW52OiB7XG4gICAgICAuLi5jb25maWcuZW52LFxuICAgICAgbW9kdWxlX2Zvcm1hdDogJ2NvbW1vbmpzJ1xuICAgIH0sXG4gICAgZm9ybWF0OiAnY2pzJyxcbiAgICB0YXJnZXQ6IFsuLi5jb25maWcudGFyZ2V0LCAnZXMyMDE5J11cbiAgfVxuXSk7XG4iLCAiY29uc3QgX19pbmplY3RlZF9maWxlbmFtZV9fID0gXCIvd29ya3NwYWNlcy9Cb3RGcmFtZXdvcmstV2ViQ2hhdC9lc2J1aWxkQmFiZWxQbHVnaW5Jc3RhbmJ1bC50c1wiO2NvbnN0IF9faW5qZWN0ZWRfZGlybmFtZV9fID0gXCIvd29ya3NwYWNlcy9Cb3RGcmFtZXdvcmstV2ViQ2hhdFwiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vd29ya3NwYWNlcy9Cb3RGcmFtZXdvcmstV2ViQ2hhdC9lc2J1aWxkQmFiZWxQbHVnaW5Jc3RhbmJ1bC50c1wiO2ltcG9ydCB7IHRyYW5zZm9ybUZpbGVBc3luYyB9IGZyb20gJ0BiYWJlbC9jb3JlJztcbmltcG9ydCB7IE9uTG9hZEFyZ3MsIE9uTG9hZE9wdGlvbnMsIE9uTG9hZFJlc3VsdCwgUGx1Z2luIH0gZnJvbSAnZXNidWlsZCc7XG5pbXBvcnQgeyBqb2luIH0gZnJvbSAncGF0aCc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcblxuZXhwb3J0IHR5cGUgUHJlZGljYXRlID0gKGFyZ3M6IE9uTG9hZEFyZ3MpID0+IGJvb2xlYW47XG5cbmV4cG9ydCB0eXBlIElzdGFuYnVsUGx1Z2luQ29uZmlnID0ge1xuICBmaWx0ZXI6IE9uTG9hZE9wdGlvbnNbJ2ZpbHRlciddO1xuICBsb2FkZXI6IE9uTG9hZFJlc3VsdFsnbG9hZGVyJ107XG4gIG5hbWU6IFBsdWdpblsnbmFtZSddO1xuICBwcmVkaWNhdGU/OiBQcmVkaWNhdGUgfCB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdFByZWRpY2F0ZTogUHJlZGljYXRlID0gYXJncyA9PiAhYXJncy5wYXRoLmluY2x1ZGVzKCcvbm9kZV9tb2R1bGVzLycpO1xuXG5leHBvcnQgY29uc3QgYmFiZWxQbHVnaW4gPSAoeyBmaWx0ZXIsIGxvYWRlciwgbmFtZSwgcHJlZGljYXRlID0gZGVmYXVsdFByZWRpY2F0ZSB9OiBJc3RhbmJ1bFBsdWdpbkNvbmZpZyk6IFBsdWdpbiA9PiAoe1xuICBuYW1lLFxuICBzZXR1cChidWlsZCkge1xuICAgIGJ1aWxkLm9uTG9hZCh7IGZpbHRlciB9LCBhc3luYyBhcmdzID0+IHtcbiAgICAgIGlmICghcHJlZGljYXRlKGFyZ3MpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdHJhbnNmb3JtRmlsZUFzeW5jKGFyZ3MucGF0aCwge1xuICAgICAgICBjb25maWdGaWxlOiBqb2luKGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKSwgJy4uL2JhYmVsLnByb2ZpbGUuY29uZmlnLmpzb24nKSxcbiAgICAgICAgcm9vdE1vZGU6ICdyb290JyxcbiAgICAgICAgc291cmNlRmlsZU5hbWU6IGFyZ3MucGF0aFxuICAgICAgfSk7XG5cbiAgICAgIGlmICghcmVzdWx0Py5jb2RlKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgRmFpbGVkIHRvIGFkZCBpbnN0cnVtZW50YXRpb24gY29kZSB0byAke2FyZ3MucGF0aH0uYCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiB7IGNvbnRlbnRzOiByZXN1bHQuY29kZSwgbG9hZGVyIH07XG4gICAgfSk7XG4gIH1cbn0pO1xuIiwgImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiL3dvcmtzcGFjZXMvQm90RnJhbWV3b3JrLVdlYkNoYXQvdHN1cC5iYXNlLmNvbmZpZy50c1wiO2NvbnN0IF9faW5qZWN0ZWRfZGlybmFtZV9fID0gXCIvd29ya3NwYWNlcy9Cb3RGcmFtZXdvcmstV2ViQ2hhdFwiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vd29ya3NwYWNlcy9Cb3RGcmFtZXdvcmstV2ViQ2hhdC90c3VwLmJhc2UuY29uZmlnLnRzXCI7aW1wb3J0IHsgdHlwZSBPcHRpb25zIH0gZnJvbSAndHN1cCc7XG5pbXBvcnQgeyBiYWJlbFBsdWdpbiwgZGVmYXVsdFByZWRpY2F0ZSwgdHlwZSBQcmVkaWNhdGUgfSBmcm9tICcuL2VzYnVpbGRCYWJlbFBsdWdpbklzdGFuYnVsJztcbmltcG9ydCBsaWdodG5pbmdDc3NQbHVnaW4gZnJvbSAndW5wbHVnaW4tbGlnaHRuaW5nY3NzL2VzYnVpbGQnO1xuXG50eXBlIFRhcmdldCA9IEV4Y2x1ZGU8T3B0aW9uc1sndGFyZ2V0J10sIEFycmF5PHVua25vd24+IHwgdW5kZWZpbmVkPjtcblxuY29uc3QgZW52ID0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgfHwgJ2RldmVsb3BtZW50JztcbmNvbnN0IHsgbnBtX3BhY2thZ2VfdmVyc2lvbiB9ID0gcHJvY2Vzcy5lbnY7XG5jb25zdCBpc3RhbmJ1bFByZWRpY2F0ZTogUHJlZGljYXRlID0gYXJncyA9PiBkZWZhdWx0UHJlZGljYXRlKGFyZ3MpICYmICEvXFwud29ya2VyXFwuW2NtXT9banRdcyQvdS50ZXN0KGFyZ3MucGF0aCk7XG5cbnR5cGUgUGx1Z2luID0gTm9uTnVsbGFibGU8T3B0aW9uc1sncGx1Z2lucyddPltudW1iZXJdO1xuY29uc3QgZGlzYWJsZVBsdWdpbiA9IChwbHVnaW5OYW1lOiBzdHJpbmcpOiBQbHVnaW4gPT4gKHtcbiAgbmFtZTogYGRpc2FibGUtcGx1Z2luLSR7cGx1Z2luTmFtZX1gLFxuICBlc2J1aWxkT3B0aW9uczogb3B0aW9ucyA9PiB7XG4gICAgY29uc3QgcGx1Z2luID0gb3B0aW9ucy5wbHVnaW5zPy5maW5kKCh7IG5hbWUgfSkgPT4gbmFtZSA9PT0gcGx1Z2luTmFtZSk7XG4gICAgaWYgKHBsdWdpbikge1xuICAgICAgcGx1Z2luLnNldHVwID0gKCkgPT4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuICB9XG59KTtcblxuY29uc3QgY3NzUGx1Z2luID0gbGlnaHRuaW5nQ3NzUGx1Z2luKHtcbiAgaW5jbHVkZTogWy9cXC5tb2R1bGVcXC5jc3MkL3VdLFxuICBvcHRpb25zOiB7XG4gICAgY3NzTW9kdWxlczoge1xuICAgICAgcGF0dGVybjogJ3dbaGFzaF1fW2xvY2FsXScsXG4gICAgICBwdXJlOiB0cnVlLFxuICAgICAgYW5pbWF0aW9uOiBmYWxzZSxcbiAgICAgIGdyaWQ6IGZhbHNlLFxuICAgICAgY3VzdG9tSWRlbnRzOiBmYWxzZVxuICAgIH1cbiAgfVxufSk7XG5cbmNvbnN0IGJhc2VDb25maWc6IE9wdGlvbnMgJiB7IHRhcmdldDogVGFyZ2V0W10gfSA9IHtcbiAgZHRzOiB0cnVlLFxuICBlbnY6IHtcbiAgICBidWlsZF90b29sOiAndHN1cCcsXG4gICAgbm9kZV9lbnY6IGVudixcbiAgICBOT0RFX0VOVjogZW52LFxuICAgIC4uLihucG1fcGFja2FnZV92ZXJzaW9uID8geyBucG1fcGFja2FnZV92ZXJzaW9uIH0gOiB7fSlcbiAgfSxcbiAgcGx1Z2luczogW2Rpc2FibGVQbHVnaW4oJ3Bvc3Rjc3MnKSwgZGlzYWJsZVBsdWdpbignc3ZlbHRlJyldLFxuICBlc2J1aWxkT3B0aW9uczogb3B0aW9ucyA9PiB7XG4gICAgLy8gZXNidWlsZCBkb24ndCB0b3VjaCBBTUQgYnV0IGl0IGFsc28gZG9uJ3QgcmVtb3ZlIEFNRCBnbHVlIGNvZGUuXG4gICAgLy8gU29tZSBvZiBvdXIgcGFja2FnZXMgcHJlZmVycyBBTUQgb3ZlciBDSlMgdmlhIFVNRCBhbmQgaXQgYWxzbyB1c2UgYW5vbnltb3VzIG1vZHVsZXMuXG4gICAgLy8gVGhpcyBjb21iaW5hdGlvbiBjb25mbGljdCB3aXRoIFJlcXVpcmVKUyBpZiBpdCBwcmVzZW50IGluIHRoZSBzeXN0ZW0uXG4gICAgLy8gV2UgYXJlIHJlbW92aW5nIEFNRCBnbHVlIGNvZGUgbWFudWFsbHksIGp1c3QgbGlrZSBob3cgUm9sbHVwIGRvZXMuXG4gICAgLy8gUmVhZCBtb3JlIGF0IGh0dHBzOi8vZ2l0aHViLmNvbS9ldmFudy9lc2J1aWxkL2lzc3Vlcy8xMzQ4LlxuICAgIC8vIEFsc28gaHR0cHM6Ly9naXRodWIuY29tL3JvbGx1cC9wbHVnaW5zL2Jsb2IvZTFhNWVmOTlmMTU3OGViMzhhOGM4NzU2M2NiOTY1MWRiMjI4ZjNiZC9wYWNrYWdlcy9jb21tb25qcy9zcmMvdHJhbnNmb3JtLWNvbW1vbmpzLmpzI0wzMjguXG4gICAgLy8gVGVzdCBjYXNlIGF0IC9fX3Rlc3RzX18vaHRtbDIvaG9zdGluZy9yZXF1aXJlanMuaHRtbC5cbiAgICBvcHRpb25zLmRlZmluZSA9IG9wdGlvbnMuZGVmaW5lIHx8IHt9O1xuICAgIG9wdGlvbnMuZGVmaW5lLmRlZmluZSA9ICd1bmRlZmluZWQnO1xuXG4gICAgb3B0aW9ucy5sZWdhbENvbW1lbnRzID0gJ2xpbmtlZCc7XG4gIH0sXG4gIGVzYnVpbGRQbHVnaW5zOlxuICAgIGVudiA9PT0gJ3Rlc3QnXG4gICAgICA/IFtcbiAgICAgICAgICBiYWJlbFBsdWdpbih7XG4gICAgICAgICAgICBmaWx0ZXI6IC9cXC5bY21dP2pzJC91LFxuICAgICAgICAgICAgbG9hZGVyOiAnanN4JyxcbiAgICAgICAgICAgIG5hbWU6ICdiYWJlbC1wbHVnaW4taXN0YW5idWw6anMnLFxuICAgICAgICAgICAgcHJlZGljYXRlOiBpc3RhbmJ1bFByZWRpY2F0ZVxuICAgICAgICAgIH0pLFxuICAgICAgICAgIGJhYmVsUGx1Z2luKHtcbiAgICAgICAgICAgIGZpbHRlcjogL1xcLmpzeCQvdSxcbiAgICAgICAgICAgIGxvYWRlcjogJ2pzeCcsXG4gICAgICAgICAgICBuYW1lOiAnYmFiZWwtcGx1Z2luLWlzdGFuYnVsOmpzeCcsXG4gICAgICAgICAgICBwcmVkaWNhdGU6IGlzdGFuYnVsUHJlZGljYXRlXG4gICAgICAgICAgfSksXG4gICAgICAgICAgYmFiZWxQbHVnaW4oe1xuICAgICAgICAgICAgZmlsdGVyOiAvXFwuW2NtXT90cyQvdSxcbiAgICAgICAgICAgIGxvYWRlcjogJ3RzJyxcbiAgICAgICAgICAgIG5hbWU6ICdiYWJlbC1wbHVnaW4taXN0YW5idWw6dHMnLFxuICAgICAgICAgICAgcHJlZGljYXRlOiBpc3RhbmJ1bFByZWRpY2F0ZVxuICAgICAgICAgIH0pLFxuICAgICAgICAgIGJhYmVsUGx1Z2luKHtcbiAgICAgICAgICAgIGZpbHRlcjogL1xcLnRzeCQvdSxcbiAgICAgICAgICAgIGxvYWRlcjogJ3RzeCcsXG4gICAgICAgICAgICBuYW1lOiAnYmFiZWwtcGx1Z2luLWlzdGFuYnVsOnRzeCcsXG4gICAgICAgICAgICBwcmVkaWNhdGU6IGlzdGFuYnVsUHJlZGljYXRlXG4gICAgICAgICAgfSksXG4gICAgICAgICAgY3NzUGx1Z2luXG4gICAgICAgIF1cbiAgICAgIDogW2Nzc1BsdWdpbl0sXG4gIGZvcm1hdDogJ2VzbScsXG4gIGxvYWRlcjogeyAnLmpzJzogJ2pzeCcgfSxcbiAgbWV0YWZpbGU6IHRydWUsXG4gIG1pbmlmeTogZW52ID09PSAncHJvZHVjdGlvbicgfHwgZW52ID09PSAndGVzdCcsXG4gIHBsYXRmb3JtOiAnYnJvd3NlcicsXG4gIHNvdXJjZW1hcDogdHJ1ZSxcbiAgc3BsaXR0aW5nOiB0cnVlLFxuICB0YXJnZXQ6IFsnY2hyb21lMTAwJywgJ2ZpcmVmb3gxMDAnLCAnc2FmYXJpMTUnXSBzYXRpc2ZpZXMgVGFyZ2V0W11cbn07XG5cbmV4cG9ydCBkZWZhdWx0IGJhc2VDb25maWc7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThSLE9BQU8sVUFBVTtBQUMvUyxTQUFTLG9CQUFvQjs7O0FDRCtPLFNBQVMsMEJBQTBCO0FBRS9TLFNBQVMsWUFBWTtBQUNyQixTQUFTLHFCQUFxQjtBQUhpSSxJQUFNLCtCQUErQjtBQWM3TCxJQUFNLG1CQUE4QixVQUFRLENBQUMsS0FBSyxLQUFLLFNBQVMsZ0JBQWdCO0FBRWhGLElBQU0sY0FBYyxDQUFDLEVB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
