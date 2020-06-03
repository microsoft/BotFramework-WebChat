/* eslint no-console: "off" */

import { useRef } from 'react';

export default function useDebugDeps(depsMap, name) {
  const lastDepsMapRef = useRef({});

  const { current: lastDepsMap } = lastDepsMapRef;
  const keys = new Set([...Object.keys(depsMap), ...Object.keys(lastDepsMap)]);
  const keysChanged = Array.from(keys).filter(key => !Object.is(depsMap[key], lastDepsMap[key]));

  if (keysChanged.length) {
    console.groupCollapsed(`Changes found in ${name}`);

    keysChanged.forEach(key => {
      console.log(key, { from: lastDepsMap[key], to: depsMap[key] });
    });

    console.groupEnd();
  }

  lastDepsMapRef.current = depsMap;
}
