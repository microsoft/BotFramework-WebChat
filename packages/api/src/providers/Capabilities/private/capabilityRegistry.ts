import type { Capabilities } from '../types/Capabilities';

/**
 * Descriptor for a capability that can be fetched from the adapter.
 */
export type CapabilityDescriptor<K extends keyof Capabilities> = {
  /** The key in the Capabilities object */
  readonly key: K;
  /** The getter function name on the adapter (e.g., 'getVoiceConfiguration') */
  readonly getterName: string;
  /**
   * Custom equality comparator for this capability.
   * If not provided, uses shallow object comparison.
   * Return true if values are equal (should reuse previous reference).
   */
  readonly isEqual?: (a: Capabilities[K], b: Capabilities[K]) => boolean;
};

/**
 * Registry of all capabilities.
 *
 * To add a new capability:
 * 1. Add type to Capabilities interface in types/Capabilities.ts
 * 2. Add entry here with key, getterName, and optional custom isEqual
 *
 * @example
 * // Simple capability (uses default shallowEqual)
 * { key: 'voiceConfiguration', getterName: 'getVoiceConfiguration' }
 *
 * @example
 * // Capability with custom equality check
 * {
 *   key: 'complexConfig',
 *   getterName: 'getComplexConfig',
 *   isEqual: (a, b) => a?.nested?.value === b?.nested?.value
 * }
 */
const CAPABILITY_REGISTRY: readonly CapabilityDescriptor<keyof Capabilities>[] = Object.freeze([
  {
    key: 'voiceConfiguration',
    getterName: 'getVoiceConfiguration'
  },
  {
    key: 'isVoiceOnlyMode',
    getterName: 'getIsVoiceOnlyMode'
  }
]);

export default CAPABILITY_REGISTRY;
