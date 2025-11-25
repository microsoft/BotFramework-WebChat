import type { HowToGroupingMapPartEntry } from '../types';

export default function computePartListTimestamp(partList: readonly HowToGroupingMapPartEntry[]): number | undefined {
  return partList.reduce<number | undefined>(
    (max, { logicalTimestamp }) =>
      typeof logicalTimestamp === 'undefined' ? max : Math.max(max ?? -Infinity, logicalTimestamp),
    undefined
  );
}
