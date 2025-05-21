/**
 * This entry file is for Vite plugin.
 *
 * @module
 */

import LightningCSS from './index'

/**
 * Vite plugin
 *
 * @example
 * ```ts
 * // vite.config.ts
 * import Starter from 'unplugin-lightningcss/vite'
 *
 * export default defineConfig({
 *   plugins: [Starter()],
 * })
 * ```
 */
const vite = LightningCSS.vite as typeof LightningCSS.vite
export default vite
export { vite as 'module.exports' }
