# unplugin-lightningcss [![npm](https://img.shields.io/npm/v/unplugin-lightningcss.svg)](https://npmjs.com/package/unplugin-lightningcss) [![jsr](https://jsr.io/badges/@unplugin/lightningcss)](https://jsr.io/@unplugin/lightningcss)

[![Unit Test](https://github.com/unplugin/unplugin-lightningcss/actions/workflows/unit-test.yml/badge.svg)](https://github.com/unplugin/unplugin-lightningcss/actions/workflows/unit-test.yml)

Lightning CSS integration for Vite, Rollup, esbuild, Webpack, Vue CLI, and more.

## Installation

```bash
npm i -D unplugin-lightningcss
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import LightningCSS from 'unplugin-lightningcss/vite'

export default defineConfig({
  plugins: [LightningCSS()],
})
```

<br></details>

<details>
<summary>Rollup</summary><br>

Since Rollup does not support CSS out of the box, you need to use a CSS plugin like [`rollup-plugin-css-only`](https://github.com/thgh/rollup-plugin-css-only).

```ts
// rollup.config.js
import css from 'rollup-plugin-css-only'
import LightningCSS from 'unplugin-lightningcss/rollup'

export default {
  plugins: [LightningCSS(), css()],
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'

build({
  plugins: [require('unplugin-lightningcss/esbuild')()],
})
```

<br></details>

<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [require('unplugin-lightningcss/webpack')()],
}
```

<br></details>

## Example

```ts
import { Features } from 'lightningcss'

export default {
  plugins: [
    LightningCSS({
      options: {
        include: Features.Nesting,
      },
    }),
  ],
}
```

## Sponsors

<p align="center">
  <a href="https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg">
    <img src='https://cdn.jsdelivr.net/gh/sxzz/sponsors/sponsors.svg'/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2023-PRESENT [三咲智子](https://github.com/sxzz)
