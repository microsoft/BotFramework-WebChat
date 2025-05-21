/**
 * This entry file is for Rspack plugin.
 *
 * @module
 */

import LightningCSS from './index'

/**
 * Rspack plugin
 *
 * @example
 * ```js
 * // rspack.config.js
 * import LightningCSS from 'unplugin-lightningcss/rspack'
 *
 * default export {
 *  plugins: [LightningCSS()],
 * }
 * ```
 */
const rspack = LightningCSS.rspack as typeof LightningCSS.rspack
export default rspack
export { rspack as 'module.exports' }
