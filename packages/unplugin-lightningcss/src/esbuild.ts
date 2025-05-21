/**
 * This entry file is for esbuild plugin.
 *
 * @module
 */

import LightningCSS from './index'

/**
 * Esbuild plugin
 *
 * @example
 * ```ts
 * import { build } from 'esbuild'
 * import LightningCSS from 'unplugin-lightningcss/esbuild'
 * 
 * build({ plugins: [LightningCSS()] })
```
 */
const esbuild = LightningCSS.esbuild as typeof LightningCSS.esbuild
export default esbuild
export { esbuild as 'module.exports' }
