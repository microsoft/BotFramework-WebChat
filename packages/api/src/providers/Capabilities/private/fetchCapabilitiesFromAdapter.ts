import { DirectLineJSBotConnection, isForbiddenPropertyName } from 'botframework-webchat-core';
import type { Capabilities } from '../types/Capabilities';
import CAPABILITY_REGISTRY from './capabilityRegistry';
import shallowEqual from './shallowEqual';

type FetchResult = {
  capabilities: Capabilities;
  hasChanged: boolean;
};

/**
 * Fetches all capabilities from the adapter based on the registry.
 * Returns a new capabilities object with values fetched from the adapter.
 */
export default function fetchCapabilitiesFromAdapter(
  directLine: DirectLineJSBotConnection,
  prevCapabilities: Capabilities
): FetchResult {
  let hasChanged = false;

  const entries: [string, unknown][] = [];

  for (const descriptor of CAPABILITY_REGISTRY) {
    const { key, getterName, isEqual = shallowEqual } = descriptor;

    if (isForbiddenPropertyName(key) || isForbiddenPropertyName(getterName)) {
      continue;
    }

    // eslint-disable-next-line security/detect-object-injection
    const getter = directLine[getterName];

    if (typeof getter === 'function') {
      try {
        const fetchedValue = getter.call(directLine);
        // eslint-disable-next-line security/detect-object-injection
        const prevValue = prevCapabilities[key];

        if (fetchedValue) {
          if (typeof prevValue !== 'undefined' && isEqual(prevValue, fetchedValue)) {
            entries.push([key, prevValue]);
          } else {
            entries.push([key, Object.freeze({ ...fetchedValue })]);
            hasChanged = true;
          }
        } else if (typeof prevValue !== 'undefined') {
          hasChanged = true;
        }
      } catch (error) {
        console.warn(`botframework-webchat: Error calling capability ${getterName}:`, error);
      }
    }
  }

  return {
    capabilities: Object.freeze(Object.fromEntries(entries)) as Capabilities,
    hasChanged
  };
}
