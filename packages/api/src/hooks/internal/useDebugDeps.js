/* eslint no-console: "off" */

import { isForbiddenPropertyName } from 'botframework-webchat-core';
import { useRef } from 'react';

export default function useDebugDeps(depsMap, name) {
  const lastDepsMapRef = useRef({});

  const { current: lastDepsMap } = lastDepsMapRef;
  const keys = new Set([...Object.keys(depsMap), ...Object.keys(lastDepsMap)]);
  const keysChanged = Array.from(keys).filter(
    // Mitigation through denylisting.
    // eslint-disable-next-line security/detect-object-injection
    key => !isForbiddenPropertyName(key) && !Object.is(depsMap[key], lastDepsMap[key])
  );

  if (keysChanged.length) {
    console.groupCollapsed(`Changes found in ${name}`);

    keysChanged.forEach(key => {
      // Mitigation through denylisting.
      // eslint-disable-next-line security/detect-object-injection
      isForbiddenPropertyName(key) || console.log(key, { from: lastDepsMap[key], to: depsMap[key] });
    });

    console.groupEnd();
  }

  lastDepsMapRef.current = depsMap;
}
