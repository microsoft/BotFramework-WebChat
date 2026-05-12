import type { StrictStyleOptions, StyleOptions } from '../../../StyleOptions';
import normalizeStyleOptions from '../../../normalizeStyleOptions';

export default function rectifyStyleOptions(styleOptions: StyleOptions): StrictStyleOptions {
  return normalizeStyleOptions(styleOptions);
}
