import { isForbiddenPropertyName } from 'botframework-webchat-core';

export default function mapMap<T>(
  map: { [key: string]: T },
  mapper: (value: T, key: string) => T
): { [key: string]: T } {
  return Object.entries(map).reduce((result, [key, value]) => {
    if (!isForbiddenPropertyName(key)) {
      // Mitigation through denylisting.
      // eslint-disable-next-line security/detect-object-injection
      result[key] = mapper(value, key);
    }

    return result;
  }, {});
}
