import { isForbiddenPropertyName } from 'botframework-webchat-core';

export default function mirrorStyle(mirrorSelector, styles) {
  const mirrored = {};

  for (const [key, value] of Object.entries(styles)) {
    if (typeof value === 'number' || typeof value === 'string') {
      const patchedKey = key.replace(/(^left|^right|Left|Right)/u, match =>
        match === 'Left' ? 'Right' : match === 'left' ? 'right' : match === 'Right' ? 'Left' : 'left'
      );

      if (!isForbiddenPropertyName(patchedKey)) {
        // Mitigated through denylisting.
        // eslint-disable-next-line security/detect-object-injection
        mirrored[patchedKey] = value;
      }
    } else if (!isForbiddenPropertyName(key)) {
      // Mitigated through denylisting.
      // eslint-disable-next-line security/detect-object-injection
      mirrored[key] = mirrorStyle('', value);
    }
  }

  const relative = /^&\s*/gu.exec(mirrorSelector) || '';

  return mirrorSelector
    ? {
        [`${relative}:not(${mirrorSelector.substr(relative.length)})`]: styles,
        [mirrorSelector]: mirrored
      }
    : mirrored;
}
