/**
 * This entry file is for Rolldown plugin.
 *
 * @module
 */

import LightningCSS from './index'

/**
 * Rolldown plugin
 *
 * @example
 * ```ts
 * // rolldown.config.js
 * import Starter from 'unplugin-lightningcss/rolldown'
 *
 * export default {
 *   plugins: [Starter()],
 * }
 * ```
 */
const rolldown = LightningCSS.rolldown as typeof LightningCSS.rolldown
export default rolldown
export { rolldown as 'module.exports' }
