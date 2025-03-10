import { isForbiddenPropertyName } from 'botframework-webchat-core';

export default function mapMap(map, mapper) {
  return Object.entries(map).reduce((result, [key, value]) => {
    if (!isForbiddenPropertyName(key)) {
      // Mitigated through denylisting.
      // eslint-disable-next-line security/detect-object-injection
      result[key] = mapper(value, key);
    }

    return result;
  }, {});
}
