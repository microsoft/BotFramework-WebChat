/**
 * This entry file is for Farm plugin.
 *
 * @module
 */

import LightningCSS from './index'

/**
 * Farm plugin
 *
 * @example
 * ```ts
 * // farm.config.js
 * import Starter from 'unplugin-lightningcss/farm'
 *
 * export default {
 *   plugins: [Starter()],
 * }
 * ```
 */
const farm = LightningCSS.farm as typeof LightningCSS.farm
export default farm
export { farm as 'module.exports' }
