import type { GlobalScopePonyfill } from '../types/GlobalScopePonyfill';

export default function sleep(interval: number, ponyfill: GlobalScopePonyfill): Promise<void> {
  return new Promise(resolve => ponyfill.setTimeout(resolve, Math.max(interval, 0)));
}
