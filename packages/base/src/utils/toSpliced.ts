// @ts-expect-error: no types available
import coreJSToSpliced from 'core-js-pure/features/array/to-spliced.js';

export default function toSpliced<T>(array: readonly T[], start: number, deleteCount: number, ...items: T[]): T[] {
  return coreJSToSpliced(array, start, deleteCount, ...items);
}
