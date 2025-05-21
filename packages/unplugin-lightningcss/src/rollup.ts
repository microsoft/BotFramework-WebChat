/**
 * This entry file is for Rollup plugin.
 *
 * @module
 */

import LightningCSS from './index'

/**
 * Rollup plugin
 *
 * @example
 * ```ts
 * // rollup.config.js
 * import Starter from 'unplugin-lightningcss/rollup'
 *
 * export default {
 *   plugins: [Starter()],
 * }
 * ```
 */
const rollup = LightningCSS.rollup as typeof LightningCSS.rollup
export default rollup
export { rollup as 'module.exports' }
