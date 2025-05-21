/**
 * This entry file is for webpack plugin.
 *
 * @module
 */

import LightningCSS from './index'

/**
 * Webpack plugin
 *
 * @example
 * ```js
 * // webpack.config.js
 * import LightningCSS from 'unplugin-lightningcss/webpack'
 *
 * default export {
 *  plugins: [LightningCSS()],
 * }
 * ```
 */
const webpack = LightningCSS.webpack as typeof LightningCSS.webpack
export default webpack
export { webpack as 'module.exports' }
