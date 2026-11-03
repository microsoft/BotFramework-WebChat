/* eslint no-console: "off" */

import { useRef } from 'react';

export default function useDebugDeps(depsObject: Record<string, unknown>, name: string): void {
  const depsMap = Object.freeze(new Map(Object.entries(depsObject)));
  const prevDepsMapRef = useRef<ReadonlyMap<string, unknown> | undefined>();

  const { current: prevDepsMap } = prevDepsMapRef;

  // Ignores initial rendering.
  if (prevDepsMap) {
    const keys = new Set([...depsMap.keys(), ...prevDepsMap.keys()]);
    const keysChanged = Array.from(keys).filter(key => !Object.is(depsMap.get(key), prevDepsMap.get(key)));

    if (keysChanged.length) {
      console.groupCollapsed(`Changes found in ${name}`);

      keysChanged.forEach(key => console.log(key, { from: prevDepsMap.get(key), to: depsMap.get(key) }));

      console.groupEnd();
    }
  }

  prevDepsMapRef.current = depsMap;
}
